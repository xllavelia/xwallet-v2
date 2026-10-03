// Каталог оружия Open City.
// Новый тип (SMG, shotgun, rifle...) = новая запись в WEAPONS + спрайт
// в textures.js. combat.js и HUD работают только с записями каталога —
// под конкретное оружие ничего не захардкожено.

var WEAPONS = {
  pistol: {
    id: "pistol",
    name: "Pistol",
    damage: 25,          // урон за выстрел (Thug 50 HP = 2 попадания)
    cooldownMs: 350,    // fire cooldown между выстрелами
    range: 260,         // макс дистанция выстрела и автоприцела
    magSize: 12,        // патронов в магазине
    ammoReserveMax: 48, // запас патронов
    reloadMs: 1200,     // длительность перезарядки
    verb: "Fire"
  }
};

// порядок в будущем инвентаре оружия (сейчас пистолет один)
var WEAPON_ORDER = ["pistol"];

// Живое состояние экземпляра оружия в руке игрока.
function makeWeaponState(def) {
  return {
    def: def,
    mag: def.magSize,
    reserve: def.ammoReserveMax,
    state: "ready", // ready | cooldown | reloading
    cooldownUntil: 0,
    reloadUntil: 0
  };
}

export { WEAPONS, WEAPON_ORDER, makeWeaponState };