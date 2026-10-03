// Interaction System: единый детектор ближайшего доступного объекта.
// Работает внутри игрового runtime (вызывается каждый кадр из game loop),
// в React уходит только событие смены цели — постоянных перерендеров нет.
// Приоритет однозначен: ближайший доступный; объекты вне своего радиуса
// вообще не считаются кандидатами.

function InteractionSystem() {
  this.entities = [];
  this.current = null;
  this.onChange = null; // вызывается только при реальной смене/потере цели
}

InteractionSystem.prototype.register = function (e) {
  this.entities.push(e);
};

InteractionSystem.prototype.unregister = function (e) {
  var i = this.entities.indexOf(e);
  if (i >= 0) this.entities.splice(i, 1);
  if (this.current === e) {
    this.current = null;
    if (this.onChange) this.onChange(null); // объект исчез — кнопка гаснет сразу
  }
};

// px, py — центр игрока. Ближайшая enabled-сущность в пределах её
// собственного радиуса, иначе null.
InteractionSystem.prototype.nearest = function (px, py) {
  var best = null;
  var bestD = Infinity;
  for (var i = 0; i < this.entities.length; i++) {
    var e = this.entities[i];
    if (!e.enabled) continue;
    var d = e.distanceTo(px, py);
    if (d > e.radius) continue;
    if (d < bestD) { bestD = d; best = e; }
  }
  return best;
};

// Каждый кадр; уведомляет React только когда цель реально сменилась,
// поэтому события редкие и мгновенные (без задержки, без спама).
InteractionSystem.prototype.update = function (px, py) {
  var t = this.nearest(px, py);
  if (t === this.current) return;
  this.current = t;
  if (this.onChange) this.onChange(t);
};

// ACTION нажата: выполняет действие текущей цели, если она есть.
InteractionSystem.prototype.interact = function (game) {
  var t = this.current;
  if (!t || !t.onInteract) return;
  t.onInteract(game, t);
};

export { InteractionSystem };