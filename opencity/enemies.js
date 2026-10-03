// Базовый enemy entity: HP/макс HP, скорость, агро-радиус, атака,
// состояние idle|chase|attack и alive/dead. Движение — через общий
// moveAndCollide со слайдингом вдоль стен: сквозь здания не ходим.
// Сюда позже: виды врагов, loot-таблицы, ranged-атаки, патрулирование.

import * as PIXI from "pixi.js";
import { Entity } from "./entities.js";
import { moveAndCollide } from "./collision.js";
import { OC_CONFIG } from "./config.js";

var R = 12; // радиус тела врага (как у игрока)

// тестовые враги: четыре громилы по краям площади + брутал с юга
var ENEMY_DEFS = [
  { id: "thug.1", name: "Thug",  x: 560,  y: 560,  hp: 50,  speed: 90, aggro: 190, attackRange: 30, damage: 8,  attackCooldownMs: 900 },
  { id: "thug.2", name: "Thug",  x: 1040, y: 560,  hp: 50,  speed: 90, aggro: 190, attackRange: 30, damage: 8,  attackCooldownMs: 900 },
  { id: "thug.3", name: "Thug",  x: 560,  y: 1040, hp: 50,  speed: 90, aggro: 190, attackRange: 30, damage: 8,  attackCooldownMs: 900 },
  { id: "thug.4", name: "Thug",  x: 1040, y: 1040, hp: 50,  speed: 90, aggro: 190, attackRange: 30, damage: 8,  attackCooldownMs: 900 },
  { id: "brute.1", name: "Brute", x: 800, y: 1180, hp: 100, speed: 65, aggro: 210, attackRange: 34, damage: 15, attackCooldownMs: 1300 }
];

function drawHP(e) {
  var g = e.hpBar;
  g.clear();
  if (!e.data.alive || e.data.hp >= e.data.maxHp) return; // полное HP не рисуем
  g.beginFill(0x0b0b0c).drawRect(0, 0, 24, 4).endFill();
  var w = Math.round(24 * Math.max(0, e.data.hp) / e.data.maxHp);
  if (w > 2) g.beginFill(0xff5a5a).drawRect(1, 1, w - 2, 2).endFill();
}

function createEnemy(def, textures, world) {
  var container = new PIXI.Container();
  var body = new PIXI.Sprite(textures.enemyBody);
  body.anchor.set(0.5);
  container.addChild(body);

  var hpBar = new PIXI.Graphics();
  hpBar.position.set(-12, -22);
  container.addChild(hpBar);

  var e = new Entity({
    id: def.id, type: "enemy", name: def.name,
    x: def.x, y: def.y, radius: 0, verb: "", // в InteractionSystem не идут
    container: container,
    data: {
      hp: def.hp, maxHp: def.hp,
      speed: def.speed,
      aggroRadius: def.aggro,
      attackRange: def.attackRange,
      damage: def.damage,
      attackCooldownMs: def.attackCooldownMs,
      attackUntil: 0,
      state: "idle", // idle | chase | attack
      alive: true
      // дальше: lootTable, armor, ranged...
    }
  });
  e.body = { x: def.x - R, y: def.y - R, w: R * 2, h: R * 2 };
  e.hpBar = hpBar;
  e.syncHP = function () { drawHP(e); };
  container.position.set(def.x, def.y);
  world.addChild(container);
  return e;
}

function clampToWorld(body) {
  if (body.x < 0) body.x = 0;
  if (body.y < 0) body.y = 0;
  if (body.x + body.w > OC_CONFIG.worldWidth) body.x = OC_CONFIG.worldWidth - body.w;
  if (body.y + body.h > OC_CONFIG.worldHeight) body.y = OC_CONFIG.worldHeight - body.h;
}

// ИИ одного врага за тик. game даёт доступ к игроку и коллизиям.
function updateEnemyAI(e, dt, game) {
  var d = e.data;
  if (!d.alive) return;

  var px = game.player.centerX();
  var py = game.player.centerY();
  var dx = px - e.x;
  var dy = py - e.y;
  var dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) dist = 1;

  if (d.state === "idle") {
    if (dist <= d.aggroRadius) d.state = "chase";
    return; // стоим, пока не заметили игрока
  }

  if (d.state === "chase") {
    if (dist > d.aggroRadius * 1.6) { d.state = "idle"; return; } // оторвались
    if (dist <= d.attackRange) { d.state = "attack"; return; }
    var vx = (dx / dist) * d.speed * dt;
    var vy = (dy / dist) * d.speed * dt;
    moveAndCollide(e.body, vx, 0, game.colliders);
    moveAndCollide(e.body, 0, vy, game.colliders);
    clampToWorld(e.body);
    e.x = e.body.x + R;
    e.y = e.body.y + R;
    e.container.position.set(e.x, e.y);
    return;
  }

  if (d.state === "attack") {
    if (dist > d.attackRange * 1.3) { d.state = "chase"; return; }
    var now = performance.now();
    if (now >= d.attackUntil) {
      d.attackUntil = now + d.attackCooldownMs;
      game.damagePlayer(d.damage, e);
    }
  }
}

function spawnEnemies(world, textures) {
  var list = [];
  for (var i = 0; i < ENEMY_DEFS.length; i++) {
    list.push(createEnemy(ENEMY_DEFS[i], textures, world));
  }
  return list;
}

export { spawnEnemies, updateEnemyAI };