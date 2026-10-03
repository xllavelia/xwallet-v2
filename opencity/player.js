// Игрок: позиция, скорость, направление, pixel-art спрайт с кадрами
// направлений (down/up/side) и шага (stand/walkA/walkB). Side зеркалится
// scale.x. Оружие — потомок nub, крутится с направлением.

import * as PIXI from "pixi.js";
import { OC_CONFIG } from "./config.js";
import { moveAndCollide } from "./collision.js";

function Player(textures, x, y) {
  var size = OC_CONFIG.playerRadius * 2;
  this.x = x - OC_CONFIG.playerRadius;
  this.y = y - OC_CONFIG.playerRadius;
  this.w = size; this.h = size;
  this.dir = 0;
  this.state = "idle";
  this.speed = OC_CONFIG.playerSpeed;
  this.gun = null;
  this.frames = textures.player;
  this.facing = "down";
  this.step = 0;
  this.animT = 0;

  this.container = new PIXI.Container();
  this.body = new PIXI.Sprite(this.frames.down.stand);
  this.body.anchor.set(0.5);
  this.body.width = 36; this.body.height = 48;
  this.nub = new PIXI.Sprite(textures.playerNub);
  this.nub.anchor.set(0.5);
  this.nub.visible = false;
  this.container.addChild(this.body);
  this.container.addChild(this.nub);
  this.sync();
}

Player.prototype.centerX = function () { return this.x + this.w / 2; };
Player.prototype.centerY = function () { return this.y + this.h / 2; };

Player.prototype.sync = function () {
  this.container.position.set(this.centerX(), this.centerY());
  this.nub.rotation = this.dir;
};

Player.prototype.setGun = function (sprite) {
  if (this.gun) this.nub.removeChild(this.gun);
  this.gun = sprite || null;
  if (sprite) {
    sprite.anchor.set(0.5);
    sprite.position.set(10, 0);
    this.nub.visible = true;
    this.nub.addChild(sprite);
  } else {
    this.nub.visible = false;
  }
};

// выбор кадра: направление по вектору движения + фаза шага
Player.prototype.refreshSprite = function (moving, dt) {
  var f = this.facing;
  if (moving) {
    this.animT += dt;
    if (this.animT > 0.14) { this.animT = 0; this.step = (this.step + 1) % 2; }
  } else {
    this.step = 0;
  }
  var leg = !moving ? "stand" : (this.step === 0 ? "a" : "b");
  var set = this.frames[f] || this.frames.down;
  var tex = set[leg] || set.stand;
  if (this.body.texture !== tex) this.body.texture = tex;
  this.body.scale.x = (f === "side" && this.sideSign < 0) ? -Math.abs(this.body.scale.x) : Math.abs(this.body.scale.x);
  if (this.body.width !== 36) { this.body.width = 36; this.body.height = 48; }
};

Player.prototype.update = function (dt, vec, colliders) {
  var vx = vec.x * this.speed * vec.mag;
  var vy = vec.y * this.speed * vec.mag;

  moveAndCollide(this, vx * dt, 0, colliders);
  moveAndCollide(this, 0, vy * dt, colliders);

  if (this.x < 0) this.x = 0;
  if (this.y < 0) this.y = 0;
  if (this.x + this.w > OC_CONFIG.worldWidth) this.x = OC_CONFIG.worldWidth - this.w;
  if (this.y + this.h > OC_CONFIG.worldHeight) this.y = OC_CONFIG.worldHeight - this.h;

  var moving = vec.mag > 0.05;
  if (moving) {
    this.dir = Math.atan2(vec.y, vec.x);
    this.state = "walk";
    if (Math.abs(vec.x) > Math.abs(vec.y)) { this.facing = "side"; this.sideSign = vec.x < 0 ? -1 : 1; }
    else { this.facing = vec.y < 0 ? "up" : "down"; this.sideSign = 1; }
  } else {
    this.state = "idle";
  }
  this.refreshSprite(moving, dt);
  this.sync();
};

export { Player };