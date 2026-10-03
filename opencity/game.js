// Ядро runtime: PIXI.Application, игровой loop, мир/игрок/камера/ввод,
// Interaction System, Combat System, оружие, HP, характеристики,
// location-система (районы), входы/выходы в интерьеры, данные для карты.
// React знает файл только через opts-колбэки и публичные методы.

import * as PIXI from "pixi.js";
import { OC_CONFIG } from "./config.js";
import { makePlaceholderTextures } from "./textures.js";
import { buildWorld } from "./world.js";
import { Player } from "./player.js";
import { Camera } from "./camera.js";
import { InteractionSystem } from "./interactions.js";
import { populateWorld } from "./populate.js";
import { buildInterior } from "./interiors.js";
import { WEAPONS, makeWeaponState } from "./weapons.js";
import { CombatSystem } from "./combat.js";
import { spawnEnemies } from "./enemies.js";
import { ROADS, PLAZA, WATER, PARKS } from "./city.js";

import { DISTRICTS, BUILDINGS, POIS, districtAt, getInterior } from "./city.js";

function round2(v) { return Math.round(v * 100) / 100; }

function OpenCityGame(host, opts) {
  this.host = host;
  this.opts = opts || {};
  this.onSavePosition = this.opts.onSavePosition || null;
  this.joystick = this.opts.joystick || null;
  this.keyboard = this.opts.keyboard || null;

  this.onActionChange = this.opts.onActionChange || null;
  this.onWeaponUpdate = this.opts.onWeaponUpdate || null;
  this.onPlayerHP = this.opts.onPlayerHP || null;
  this.onKill = this.opts.onKill || null;
  this.onPlayerDeath = this.opts.onPlayerDeath || null;
  this.onDialog = this.opts.onDialog || null;
  this.onBuilding = this.opts.onBuilding || null;
  this.onToast = this.opts.onToast || null;
  this.onPickUp = this.opts.onPickUp || null;
  this.onLocationChange = this.opts.onLocationChange || null;

  this.dict = opts.dict || {};
  this.uiBlocked = false;
  this.weapon = null;

  this.equippedId = "";
  this.baseSpeed = OC_CONFIG.playerSpeed;
  this.playerSpeedPct = 100;
  this.damageBonus = 0;
  this.defensePct = 0;
  this.accuracyPct = 85;

  this.playerMaxHP = 100;
  this.playerHP = 100;
  this.dead = false;
  this.hurtUntil = 0;

  // интерьеры: exterior хранится всегда, чтобы состояние мира не терялось
  this.interiorActive = false;
  this.interior = null;
  this.exitInfo = null;
  this.exteriorEntities = [];

  this.app = new PIXI.Application({
    backgroundAlpha: 0,
    resizeTo: host,
    antialias: false,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true
  });
  host.appendChild(this.app.view);

  var textures = makePlaceholderTextures(this.app);
  this.textures = textures;
  this.exterior = buildWorld(this.app, textures);
  this.world = this.exterior.container;
  this.colliders = this.exterior.colliders;
  this.app.stage.addChild(this.world);

  this.interactions = new InteractionSystem();
  var self = this;
  this.interactions.onChange = function () { self.emitAction(); };
  this.exteriorEntities = populateWorld(this.world, textures, this.interactions, this.exterior.doorSpots);

  this.combat = new CombatSystem(this, textures);
  var spawned = spawnEnemies(this.world, textures);
  for (var ei = 0; ei < spawned.length; ei++) this.combat.addEnemy(spawned[ei]);
  this.gunSprite = new PIXI.Sprite(textures.pistol);

  var pos = this.opts.initialPosition || null;
  var sx = OC_CONFIG.spawnX;
  var sy = OC_CONFIG.spawnY;
  if (pos && isFinite(pos.x) && isFinite(pos.y)) {
    if (pos.x !== 0 || pos.y !== 0) { sx = pos.x; sy = pos.y; }
  }

  // location: район под точкой спавна; он же открыт на карте сразу
  var d0 = districtAt(sx, sy);
  this.location = d0 ? d0.id : "downtown";
  this.discovered = {};
  this.discovered[this.location] = true;

  this.player = new Player(textures, sx, sy);
  this.player.speed = this.baseSpeed * this.playerSpeedPct / 100;
  this.world.addChild(this.player.container);

  this.camera = new Camera(this.app);
  this.camera.snap(sx, sy);
  this.applyCamera();

  this.lastSavedX = sx;
  this.lastSavedY = sy;
  this.saveTimer = 0;

  this._tick = function (delta) {
    var dt = delta / 60;
    if (dt > 0.05) dt = 0.05;
    self.update(dt);
  };
  this.app.ticker.add(this._tick);

  this._onHide = function () { self.flushSave(); };
  this._onVis = function () { if (document.visibilityState === "hidden") self.flushSave(); };
  window.addEventListener("pagehide", this._onHide);
  document.addEventListener("visibilitychange", this._onVis);
}

OpenCityGame.prototype.update = function (dt) {
  var vec = { x: 0, y: 0, mag: 0 };
  if (!this.uiBlocked) {
    var j = this.joystick ? this.joystick.getVector() : null;
    if (j && j.mag > 0) vec = j;
    else if (this.keyboard) vec = this.keyboard.getVector();
  }

  this.player.update(dt, vec, this.colliders);
  this.camera.follow(this.player.centerX(), this.player.centerY(), dt);
  this.applyCamera();
  this.interactions.update(this.player.centerX(), this.player.centerY());

  // location-система: район под игроком + открытие района на карте
  if (!this.interiorActive) {
    var d = districtAt(this.player.centerX(), this.player.centerY());
    if (d) {
      if (!this.discovered[d.id]) this.discover(d);
      if (d.id !== this.location) { this.location = d.id; this.emitLocation(); }
    }
    this.combat.update(dt);
  }

  if (this.player.body.tint !== 0xffffff && performance.now() > this.hurtUntil) {
    this.player.body.tint = 0xffffff;
  }

  this.saveTimer += dt * 1000;
  if (this.saveTimer >= OC_CONFIG.saveIntervalMs) {
    this.saveTimer = 0;
    this.saveIfMoved();
  }
};

OpenCityGame.prototype.applyCamera = function () {
  var viewW = this.app.screen.width;
  var viewH = this.app.screen.height;
  var px = Math.round(viewW / 2 - this.camera.x);
  var py = Math.round(viewH / 2 - this.camera.y);
  this.app.stage.position.set(px, py);
};

// ---------- location / карта ----------

OpenCityGame.prototype.emitLocation = function () {
  if (this.onLocationChange) this.onLocationChange({ location: this.location, discovered: this.discovered });
};

OpenCityGame.prototype.discover = function (d) {
  if (this.discovered[d.id]) return;
  this.discovered[d.id] = true;
  if (this.onToast) this.onToast("Discovered " + d.name);
  this.emitLocation();
};

OpenCityGame.prototype.getMapData = function () {
  return {
    world: { w: OC_CONFIG.worldWidth, h: OC_CONFIG.worldHeight },
    districts: DISTRICTS,
    roads: ROADS,
    plaza: PLAZA,
    water: WATER,
    parks: PARKS,
    buildings: BUILDINGS,
    pois: POIS,
    discovered: this.discovered,
    location: this.location,
    player: { x: this.player.centerX(), y: this.player.centerY() }
  };
};
// ---------- интерьеры: вход/выход с сохранением позиции ----------

OpenCityGame.prototype.swapEntities = function (list) {
  var old = this.interactions.entities.slice();
  for (var i = 0; i < old.length; i++) this.interactions.unregister(old[i]);
  for (i = 0; i < list.length; i++) this.interactions.register(list[i]);
};

OpenCityGame.prototype.enterInterior = function (doorEntity) {
  if (this.interiorActive) return;
  var b = doorEntity.data.building;
  var def = b ? getInterior(b.interior) : null;
  if (!def) return;

  this.exitInfo = { x: this.player.centerX(), y: this.player.centerY(), location: this.location };
  this.swapEntities([]);

  var built = buildInterior(def, this.textures);
  this.interior = built;
  this.interiorActive = true;
  this.app.stage.removeChild(this.world);
  this.world = built.container;
  this.app.stage.addChild(this.world);
  this.colliders = built.colliders;

  this.player.x = def.spawn.x - OC_CONFIG.playerRadius;
  this.player.y = def.spawn.y - OC_CONFIG.playerRadius;
  this.player.sync();
  this.location = "int:" + def.id;
  this.camera.snap(def.spawn.x, def.spawn.y);
  this.applyCamera();
  this.swapEntities(built.entities);
  this.emitLocation();
  this.emitAction();
};

OpenCityGame.prototype.exitInterior = function () {
  if (!this.interiorActive) return;
  this.swapEntities([]);
  this.app.stage.removeChild(this.world);
  this.world = this.exterior.container;
  this.app.stage.addChild(this.world);
  this.colliders = this.exterior.colliders;
  this.interior = null;
  this.interiorActive = false;

  if (this.exitInfo) {
    this.player.x = this.exitInfo.x - OC_CONFIG.playerRadius;
    this.player.y = this.exitInfo.y - OC_CONFIG.playerRadius;
    this.location = this.exitInfo.location;
    this.exitInfo = null;
  }
  this.player.sync();
  this.camera.snap(this.player.centerX(), this.player.centerY());
  this.applyCamera();
  this.swapEntities(this.exteriorEntities);
  this.emitLocation();
  this.emitAction();
};

// ---------- ACTION ----------

OpenCityGame.prototype.emitAction = function () {
  if (!this.onActionChange) return;
  if (this.weapon) {
    var t = this.combat.target;
    this.onActionChange({ mode: "fire", verb: "Fire", name: t ? t.name : "No target", hasTarget: !!t });
    return;
  }
  var it = this.interactions.current;
  if (!it) { this.onActionChange(null); return; }
  this.onActionChange({ mode: "interact", verb: it.verb, name: it.name });
};

OpenCityGame.prototype.interact = function () {
  if (this.uiBlocked || this.weapon) return;
  this.interactions.interact(this);
};

OpenCityGame.prototype.fire = function () {
  if (!this.weapon || this.uiBlocked || this.dead) return;
  this.combat.fire();
};

OpenCityGame.prototype.toggleWeapon = function () {
  if (this.dead) return;
  if (this.weapon) { this.weapon = null; this.player.setGun(null); }
  else {
    var def = WEAPONS[this.equippedId];
    if (!def) return;
    this.weapon = makeWeaponState(def);
    this.player.setGun(this.gunSprite);
  }
  this.emitWeapon();
  this.emitAction();
};

OpenCityGame.prototype.setEquipped = function (id) {
  id = id || "";
  // то же оружие уже в руках — не пересоздаём магазин/запас
  if (id === this.equippedId && (this.weapon || !WEAPONS[id])) return;
  if (this.weapon) { this.weapon = null; this.player.setGun(null); }
  this.equippedId = id;
  var def = WEAPONS[this.equippedId];
  if (def && !this.dead) {
    this.weapon = makeWeaponState(def);
    this.player.setGun(this.gunSprite);
  }
  this.emitWeapon();
  this.emitAction();
};

OpenCityGame.prototype.emitWeapon = function () {
  if (!this.onWeaponUpdate) return;
  if (!this.weapon) { this.onWeaponUpdate(null); return; }
  var w = this.weapon;
  this.onWeaponUpdate({ id: w.def.id, name: w.def.name, active: true, mag: w.mag, reserve: w.reserve, state: w.state });
};

OpenCityGame.prototype.emitHUD = function () {
  if (this.onPlayerHP) this.onPlayerHP({ hp: this.playerHP, max: this.playerMaxHP });
};

// ---------- урон, лечение, смерть ----------

OpenCityGame.prototype.damagePlayer = function (dmg, source) {
  if (this.dead) return;
  var reduced = Math.round(dmg * (1 - this.defensePct / 100));
  if (reduced < 1) reduced = 1;
  this.playerHP -= reduced;
  this.hurtUntil = performance.now() + 150;
  this.player.body.tint = 0xff6b6b;
  if (this.playerHP <= 0) {
    this.playerHP = 0;
    this.dead = true;
    this.uiBlocked = true;
    if (this.onPlayerDeath) this.onPlayerDeath();
  }
  this.emitHUD();
};

OpenCityGame.prototype.heal = function (amount) {
  if (this.dead || !amount || amount <= 0) return;
  this.playerHP += amount;
  if (this.playerHP > this.playerMaxHP) this.playerHP = this.playerMaxHP;
  this.emitHUD();
};

OpenCityGame.prototype.respawn = function () {
  this.playerHP = this.playerMaxHP;
  this.dead = false;
  this.uiBlocked = false;
  if (this.interiorActive) this.exitInterior();
  this.player.x = OC_CONFIG.spawnX - OC_CONFIG.playerRadius;
  this.player.y = OC_CONFIG.spawnY - OC_CONFIG.playerRadius;
  this.player.sync();
  this.camera.snap(OC_CONFIG.spawnX, OC_CONFIG.spawnY);
  this.applyCamera();
  this.emitHUD();
};

// ---------- Interaction: диалоги, здания, сюжет ----------

OpenCityGame.prototype.openDialog = function (entity) {
  if (!this.onDialog) return;
  var dlg = entity.data.dialog;
  var lines = [];
  for (var i = 0; i < dlg.lines.length; i++) lines.push(this.dictLine(dlg.lines[i]));
  this.onDialog({ id: dlg.id, npcId: entity.id, name: entity.name, lines: lines });
};

OpenCityGame.prototype.openBuilding = function (entity) {
  if (!this.onBuilding) return;
  this.onBuilding({ id: entity.id, name: entity.name, text: this.dictLine("building.closed") });
};

// сюжетное здание: отдельный текст из словаря
OpenCityGame.prototype.openStory = function (entity) {
  if (!this.onBuilding) return;
  var b = entity.data.building;
  this.onBuilding({ id: entity.id, name: entity.name, text: this.dictLine(b && b.storyText ? b.storyText : "building.closed") });
};

OpenCityGame.prototype.pickUp = function (entity) {
  if (entity.container && entity.container.parent) entity.container.parent.removeChild(entity.container);
  entity.enabled = false;
  this.interactions.unregister(entity);
  if (this.onToast) this.onToast("Picked up " + entity.name);
  if (this.onPickUp && entity.data.itemId) {
    this.onPickUp({ id: entity.data.itemId, name: entity.name, qty: entity.data.qty || 1 });
  }
};

OpenCityGame.prototype.dictLine = function (key) {
  var v = this.dict[key];
  return typeof v === "string" && v.length > 0 ? v : "…";
};

OpenCityGame.prototype.setUIBlocked = function (v) { this.uiBlocked = !!v; };

// ---------- сохранение позиции ----------

OpenCityGame.prototype.saveIfMoved = function () {
  if (this.onSavePosition || this.interiorActive) {
    if (this.interiorActive) return;
  }
  if (!this.onSavePosition) return;
  var dx = this.player.centerX() - this.lastSavedX;
  var dy = this.player.centerY() - this.lastSavedY;
  if (dx * dx + dy * dy < 0.25) return;
  this.lastSavedX = this.player.centerX();
  this.lastSavedY = this.player.centerY();
  this.onSavePosition(round2(this.lastSavedX), round2(this.lastSavedY), this.location);
};

OpenCityGame.prototype.flushSave = function () {
  this.saveTimer = 0;
  this.saveIfMoved();
};

OpenCityGame.prototype.destroy = function () {
  this.app.ticker.remove(this._tick);
  window.removeEventListener("pagehide", this._onHide);
  document.removeEventListener("visibilitychange", this._onVis);
  this.app.destroy(true, { children: true, texture: true, baseTexture: true });
  if (this.app.view && this.app.view.parentNode) this.app.view.parentNode.removeChild(this.app.view);
};

export { OpenCityGame };