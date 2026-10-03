// Базовая структура игровых сущностей Open City.
// Любой интерактивный объект мира (NPC, дверь, предмет, точка интереса)
// создаётся через Entity/фабрики ниже. Расширение — через data:
// у NPC там позже появятся AI/квесты/магазин, у дверей — интерьеры,
// у предметов — лут/инвентарь. Новый тип = новая фабрика, интерфейс тот же.

function Entity(opts) {
  opts = opts || {};
  this.id = opts.id || "entity";
  this.type = opts.type || "poi";        // npc | door | item | poi
  this.name = opts.name || "";
  this.x = opts.x || 0;                  // мировые координаты центра
  this.y = opts.y || 0;
  this.radius = opts.radius || 48;       // радиус взаимодействия
  this.enabled = true;                   // доступность (закрыто/исчезло)
  this.verb = opts.verb || "Use";        // ярлык ACTION: Talk/Enter/Pick Up
  this.container = opts.container || null; // PIXI-контейнер в мире
  this.data = opts.data || {};           // расширяемая полезная нагрузка
  this.onInteract = opts.onInteract || null;
}

Entity.prototype.distanceTo = function (px, py) {
  var dx = this.x - px;
  var dy = this.y - py;
  return Math.sqrt(dx * dx + dy * dy);
};

// DialogDef — расширяемая структура диалога.
// lines — ключи словаря по порядку; choices/conditions/quest заложены
// под этап квестов: варианты ответов, условия показа, выдача квеста.
function DialogDef(opts) {
  opts = opts || {};
  this.id = opts.id || "dialog";
  this.lines = opts.lines || [];
  this.choices = opts.choices || null;
  this.conditions = opts.conditions || null;
  this.quest = opts.quest || null;
}

export { Entity, DialogDef };