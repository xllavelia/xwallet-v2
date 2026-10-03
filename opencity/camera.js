// Камера: экспоненциальное сглаживание следования + жёсткий клэмп
// по границам мира (экран меньше мира — край не показывает пустоту).

import { OC_CONFIG } from "./config.js";

function Camera(app) {
  this.app = app;
  this.x = OC_CONFIG.spawnX;
  this.y = OC_CONFIG.spawnY;
}

Camera.prototype.snap = function (x, y) {
  this.x = x;
  this.y = y;
  this.clamp();
};

Camera.prototype.follow = function (tx, ty, dt) {
  var k = 1 - Math.exp(-OC_CONFIG.cameraLerp * dt); // кадр-независимая плавность
  this.x += (tx - this.x) * k;
  this.y += (ty - this.y) * k;
  this.clamp();
};

Camera.prototype.clamp = function () {
  var viewW = this.app.screen.width;
  var viewH = this.app.screen.height;
  var W = OC_CONFIG.worldWidth;
  var H = OC_CONFIG.worldHeight;
  if (viewW >= W) this.x = W / 2;
  else this.x = Math.max(viewW / 2, Math.min(this.x, W - viewW / 2));
  if (viewH >= H) this.y = H / 2;
  else this.y = Math.max(viewH / 2, Math.min(this.y, H - viewH / 2));
};

export { Camera };