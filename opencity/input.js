// Ввод: floating joystick (Pointer Events, 360°) + клавиатура (WASD/стрелки).
// Joystick: палец ложится в зону -> там и рождается стик; вектор — от
// центра к пальцу, ограничен joystickMax, магнитуда кривая по радиусу.

import { OC_CONFIG } from "./config.js";

// ---------- Joystick ----------

function VirtualJoystick(zone, layer) {
  this.zone = zone;
  this.layer = layer;
  this.active = false;
  this.pointerId = null;
  this.originX = 0;
  this.originY = 0;
  this.vecX = 0;
  this.vecY = 0;
  this.mag = 0;

  this.base = document.createElement("div");
  this.base.className = "oc-joy-base";
  this.knob = document.createElement("div");
  this.knob.className = "oc-joy-knob";
  this.base.style.display = "none";
  this.knob.style.display = "none";
  layer.appendChild(this.base);
  layer.appendChild(this.knob);

  this._down = this.onDown.bind(this);
  this._move = this.onMove.bind(this);
  this._up = this.onUp.bind(this);

  zone.addEventListener("pointerdown", this._down);
  zone.addEventListener("pointermove", this._move);
  zone.addEventListener("pointerup", this._up);
  zone.addEventListener("pointercancel", this._up);
  zone.addEventListener("lostpointercapture", this._up);
}

VirtualJoystick.prototype.onDown = function (e) {
  e.preventDefault();
  if (this.active) return;
  this.active = true;
  this.pointerId = e.pointerId;
  var rect = this.layer.getBoundingClientRect();
  this.originX = e.clientX - rect.left;
  this.originY = e.clientY - rect.top;
  this.vecX = 0;
  this.vecY = 0;
  this.mag = 0;
  this.place(this.base, this.originX, this.originY, -56); // половина 112px
  this.place(this.knob, this.originX, this.originY, -24); // половина 48px
  this.base.style.display = "block";
  this.knob.style.display = "block";
  if (this.zone.setPointerCapture) {
    try { this.zone.setPointerCapture(e.pointerId); } catch (err) {}
  }
};

VirtualJoystick.prototype.place = function (el, x, y, offset) {
  el.style.left = (x + offset) + "px";
  el.style.top = (y + offset) + "px";
};

VirtualJoystick.prototype.onMove = function (e) {
  if (!this.active || e.pointerId !== this.pointerId) return;
  e.preventDefault();
  var rect = this.layer.getBoundingClientRect();
  var dx = e.clientX - rect.left - this.originX;
  var dy = e.clientY - rect.top - this.originY;
  var len = Math.sqrt(dx * dx + dy * dy);
  var max = OC_CONFIG.joystickMax;
  var m = len > max ? max / len : 1;
  var kx = dx * m;          // зажатый радиусом вектор
  var ky = dy * m;
  this.vecX = len > 0 ? dx / len : 0;
  this.vecY = len > 0 ? dy / len : 0;
  this.mag = Math.min(len / max, 1);
  this.place(this.knob, this.originX + kx, this.originY + ky, -24);
};

VirtualJoystick.prototype.onUp = function (e) {
  if (!this.active || (e.pointerId != null && e.pointerId !== this.pointerId)) return;
  this.active = false;
  this.pointerId = null;
  this.vecX = 0;
  this.vecY = 0;
  this.mag = 0;
  this.base.style.display = "none";
  this.knob.style.display = "none";
};

VirtualJoystick.prototype.getVector = function () {
  if (!this.active || this.mag < OC_CONFIG.joystickDeadzone) {
    return { x: 0, y: 0, mag: 0 };
  }
  return { x: this.vecX, y: this.vecY, mag: this.mag };
};

VirtualJoystick.prototype.destroy = function () {
  this.zone.removeEventListener("pointerdown", this._down);
  this.zone.removeEventListener("pointermove", this._move);
  this.zone.removeEventListener("pointerup", this._up);
  this.zone.removeEventListener("pointercancel", this._up);
  this.zone.removeEventListener("lostpointercapture", this._up);
  if (this.base.parentNode) this.base.parentNode.removeChild(this.base);
  if (this.knob.parentNode) this.knob.parentNode.removeChild(this.knob);
};

// ---------- Keyboard ----------

function KeyboardInput() {
  this.keys = {};
  this._down = this.onKeyDown.bind(this);
  this._up = this.onKeyUp.bind(this);
}

KeyboardInput.KEYS = {
  left: [37, 65],   // <- , A
  right: [39, 68],  // -> , D
  up: [38, 87],     // ^ , W
  down: [40, 83]    // v , S
};

KeyboardInput.prototype.attach = function () {
  window.addEventListener("keydown", this._down);
  window.addEventListener("keyup", this._up);
};

KeyboardInput.prototype.detach = function () {
  window.removeEventListener("keydown", this._down);
  window.removeEventListener("keyup", this._up);
  this.keys = {};
};

KeyboardInput.prototype.pressed = function (name) {
  var codes = KeyboardInput.KEYS[name];
  for (var i = 0; i < codes.length; i++) {
    if (this.keys[codes[i]]) return true;
  }
  return false;
};

KeyboardInput.prototype.onKeyDown = function (e) {
  this.keys[e.keyCode] = true;
  if (e.keyCode >= 37 && e.keyCode <= 40) e.preventDefault(); // стрелки не скроллят страницу
};

KeyboardInput.prototype.onKeyUp = function (e) {
  this.keys[e.keyCode] = false;
};

KeyboardInput.prototype.getVector = function () {
  var x = (this.pressed("right") ? 1 : 0) - (this.pressed("left") ? 1 : 0);
  var y = (this.pressed("down") ? 1 : 0) - (this.pressed("up") ? 1 : 0);
  if (x === 0 && y === 0) return { x: 0, y: 0, mag: 0 };
  var len = Math.sqrt(x * x + y * y);
  return { x: x / len, y: y / len, mag: 1 };
};

export { VirtualJoystick, KeyboardInput };