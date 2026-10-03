// Combat System Open City: автоприцел, выстрелы, tracer/искры,
// урон, смерти, reward-событие. Работает в game loop; React получает
// только события (смена цели, патроны, HP, смерть, килл).
// Выбор цели каждый тик: живые враги в range оружия и с line of sight,
// из них ближайший. Смена цели — мгновенно, без React-перерендеров по кадрам.
// Урон выстрела = база оружия + бонус Damage игрока; промах решает
// бросок Accuracy — из характеристик, которые мгновенно меняет Skills.

import * as PIXI from "pixi.js";
import { hasLineOfSight } from "./collision.js";
import { updateEnemyAI } from "./enemies.js";

function CombatSystem(game, textures) {
  this.game = game;
  this.enemies = [];
  this.target = null;
  this.marker = new PIXI.Sprite(textures.reticle); // над головой цели
  this.marker.anchor.set(0.5);
  this.marker.position.set(0, -30);
  this.effects = []; // {gfx, until, dur}
  this.dying = [];   // {e, until} — умершие растворяются
}

CombatSystem.prototype.addEnemy = function (e) {
  this.enemies.push(e);
};

// Цель валидна: жива, в range активного оружия, видна (LOS).
CombatSystem.prototype.isTargetable = function (e) {
  var g = this.game;
  if (!e || !e.data.alive || !g.weapon) return false;
  var px = g.player.centerX();
  var py = g.player.centerY();
  if (e.distanceTo(px, py) > g.weapon.def.range) return false;
  return hasLineOfSight(px, py, e.x, e.y, g.colliders);
};

// Автоприцел: сначала доступность (дистанция/range/LOS), затем ближайший.
CombatSystem.prototype.pickTarget = function () {
  var g = this.game;
  if (!g.weapon) { this.setTarget(null); return; }
  var px = g.player.centerX();
  var py = g.player.centerY();
  var best = null;
  var bestD = Infinity;
  for (var i = 0; i < this.enemies.length; i++) {
    var e = this.enemies[i];
    if (!this.isTargetable(e)) continue;
    var d = e.distanceTo(px, py);
    if (d < bestD) { bestD = d; best = e; }
  }
  this.setTarget(best);
};

CombatSystem.prototype.setTarget = function (e) {
  if (this.target === e) return;
  if (this.marker.parent) this.marker.parent.removeChild(this.marker);
  this.target = e;
  if (e) e.container.addChild(this.marker);
  if (this.game) this.game.emitAction(); // FAB сразу: Fire/No target
};

CombatSystem.prototype.startReload = function () {
  var w = this.game.weapon;
  if (!w || w.state === "reloading") return;
  if (w.mag >= w.def.magSize || w.reserve <= 0) return;
  w.state = "reloading";
  w.reloadUntil = performance.now() + w.def.reloadMs;
  this.game.emitWeapon();
};

// Выстрел: цель валидна, магазин не пуст, бросок меткости.
// Промах = tracer без урона; попадание = база оружия + бонус Damage.
CombatSystem.prototype.fire = function () {
  var g = this.game;
  var w = g.weapon;
  if (!w || g.uiBlocked || g.dead) return false;
  var now = performance.now();
  if (w.state === "reloading") return false;
  if (w.state === "cooldown") {
    if (now < w.cooldownUntil) return false;
    w.state = "ready";
  }
  if (w.mag <= 0) { this.startReload(); return false; } // сухой клик -> reload
  var t = this.target;
  if (!this.isTargetable(t)) return false;

  w.mag--;
  w.state = "cooldown";
  w.cooldownUntil = now + w.def.cooldownMs;
  this.spawnShotEffects(t);
  if (Math.random() * 100 > g.accuracyPct) {
    this.spawnMiss(t); // мимо: отметка рядом с целью, урона нет
  } else {
    this.hit(t, w.def.damage + g.damageBonus);
  }
  g.emitWeapon();
  if (w.mag === 0) this.startReload();
  return true;
};

CombatSystem.prototype.hit = function (e, dmg) {
  if (!e || !e.data.alive) return;
  e.data.hp -= dmg;
  e.syncHP();
  this.spawnSpark(e.x, e.y);
  if (e.data.hp <= 0) this.killEnemy(e);
};

CombatSystem.prototype.killEnemy = function (e) {
  e.data.hp = 0;
  e.data.alive = false;
  e.enabled = false;
  if (this.target === e) this.setTarget(null); // цель снята мгновенно
  this.dying.push({ e: e, until: performance.now() + 350 });
  // Reward-событие: сюда позже DOC и loot. XP уже идёт — React шлёт
  // gain_xp с ключом источника, начисление остаётся серверным.
  if (this.game.onKill) this.game.onKill({ id: e.id, name: e.name, x: e.x, y: e.y });
};

// --- визуал выстрела: tracer, вспышка у дула, искра/промах ---

CombatSystem.prototype.spawnShotEffects = function (t) {
  var g = this.game;
  var px = g.player.centerX();
  var py = g.player.centerY();
  var dx = t.x - px;
  var dy = t.y - py;
  var dist = Math.sqrt(dx * dx + dy * dy) || 1;
  var mx = px + (dx / dist) * 18;
  var my = py + (dy / dist) * 18;

  var tr = new PIXI.Graphics();
  tr.lineStyle(2, 0xffd60a, 0.95);
  tr.moveTo(mx, my);
  tr.lineTo(t.x, t.y);
  g.world.addChild(tr);
  this.effects.push({ gfx: tr, until: performance.now() + 140, dur: 140 });

  var fl = new PIXI.Graphics();
  fl.beginFill(0xffe98a).drawCircle(0, 0, 5).endFill();
  fl.position.set(mx, my);
  g.world.addChild(fl);
  this.effects.push({ gfx: fl, until: performance.now() + 90, dur: 90 });
};

CombatSystem.prototype.spawnSpark = function (x, y) {
  var g = new PIXI.Graphics();
  g.beginFill(0xffe98a).drawCircle(0, 0, 4).endFill();
  g.position.set(x, y);
  this.game.world.addChild(g);
  this.effects.push({ gfx: g, until: performance.now() + 120, dur: 120 });
};

// Промах: серое кольцо рядом с целью — визуально отличается от искры.
CombatSystem.prototype.spawnMiss = function (t) {
  var g = new PIXI.Graphics();
  g.lineStyle(1, 0x8e8e96, 0.9);
  g.drawCircle(0, 0, 6);
  g.position.set(t.x + 10, t.y - 14);
  this.game.world.addChild(g);
  this.effects.push({ gfx: g, until: performance.now() + 150, dur: 150 });
};

CombatSystem.prototype.update = function (dt) {
  var now = performance.now();
  var g = this.game;
  var w = g.weapon;

  // таймеры оружия: cooldown -> ready, reload -> досыл патронов
  if (w) {
    if (w.state === "cooldown" && now >= w.cooldownUntil) {
      w.state = "ready";
      g.emitWeapon();
    } else if (w.state === "reloading" && now >= w.reloadUntil) {
      var take = Math.min(w.def.magSize - w.mag, w.reserve);
      w.mag += take;
      w.reserve -= take;
      w.state = "ready";
      g.emitWeapon();
    }
  }

  // ИИ врагов (преследование/атака живёт в enemies.js)
  for (var i = 0; i < this.enemies.length; i++) {
    updateEnemyAI(this.enemies[i], dt, g);
  }

  // автоприцел работает только при активном оружии
  if (w) this.pickTarget();
  else if (this.target) this.setTarget(null);

  // затухание и удаление эффектов
  for (i = this.effects.length - 1; i >= 0; i--) {
    var fx = this.effects[i];
    var left = fx.until - now;
    if (left <= 0) {
      if (fx.gfx.parent) fx.gfx.parent.removeChild(fx.gfx);
      fx.gfx.destroy();
      this.effects.splice(i, 1);
    } else {
      fx.gfx.alpha = left / fx.dur;
    }
  }

  // умершие растворяются и уходят из мира
  for (i = this.dying.length - 1; i >= 0; i--) {
    var dy = this.dying[i];
    var dleft = dy.until - now;
    if (dleft <= 0) {
      if (dy.e.container.parent) dy.e.container.parent.removeChild(dy.e.container);
      this.dying.splice(i, 1);
    } else {
      dy.e.container.alpha = dleft / 350;
    }
  }
};

export { CombatSystem };