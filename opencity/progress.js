// Модель прокачки на клиенте: парсинг player-блока состояния,
// мгновенное применение характеристик к игроку и боёвке, каталог еды,
// классификация предметов для вкладок инвентаря.
// Источник истины — сервер (open_city_sql.ComputeStats); здесь значения
// только переливаются в runtime. Заменяется одна функция applyProgress —
// и скорость, урон, защита, меткость и потолок HP меняются сразу.

import { WEAPONS } from "./weapons.js";

// распределяемые характеристики (порядок — как на экране Skills)
var STAT_DEFS = [
  { id: "max_hp", name: "Max HP" },
  { id: "damage", name: "Damage" },
  { id: "defense", name: "Defense" },
  { id: "speed", name: "Speed" },
  { id: "accuracy", name: "Accuracy" }
];

// еда: сколько HP восстанавливает одна единица (фундаментальный
// каталог, как на бэке; магазины/крафт потом используют те же id)
var FOOD_HEAL = {
  apple_pie: 30,
  soda_can: 10
};

// Достижения: подготовленный раздел меню героя. Запись каталога —
// {id, name, desc, done: function(prog, ctx){...}}; рендер и вкладка
// уже готовы, список пока пуст = «No achievements yet».
var ACHIEVEMENTS = [];

// kind предмета для вкладок инвентаря. Основной источник — серверный
// kind из каталога; фолбэк по клиентским каталогам защищает цепочку
// «инвентарь -> экипировка», если запись пришла без kind: оружие
// обязано попасть во вкладку Weapons и получить кнопку Equip.
function itemKind(entry) {
  if (entry && entry.kind) return entry.kind;
  var id = entry ? entry.item_id : "";
  if (WEAPONS[id]) return "weapon";
  if (FOOD_HEAL[id]) return "food";
  return "material";
}

// прогрессия из player-блока BuildState: уровень, XP, очки,
// экипировка, итоговые характеристики и вложенные очки
function parseProgress(player) {
  player = player || {};
  var stats = player.stats || {};
  var allocated = player.stats_allocated || {};
  var out = {
    level: player.level || 1,
    xp: player.xp || 0,
    xpNext: player.xp_next || 100,
    skillPoints: player.skill_points || 0,
    equipped: player.equipped_weapon || "",
    totals: {
      max_hp: stats.max_hp || 100,
      damage: stats.damage || 0,
      defense: stats.defense || 0,
      speed: stats.speed || 100,
      accuracy: stats.accuracy || 85
    },
    allocated: {}
  };
  for (var i = 0; i < STAT_DEFS.length; i++) {
    var id = STAT_DEFS[i].id;
    out.allocated[id] = allocated[id] || 0;
  }
  return out;
}

// применить характеристики к runtime. Вызывается после каждого
// свежего state — очки с сервера отражаются в персонаже мгновенно:
// speed меняет player.speed, damageBonus/accuracyPct читает combat,
// defensePct снижает входящий урон, max_hp пересчитывает потолок
// (текущее HP сохраняет пропорцию, чтобы «лечения» не происходило)
function applyProgress(game, prog) {
	if (!game || !prog) return;
	var t = prog.totals;
	if (game.playerSpeedPct !== t.speed && game.player) {
		game.player.speed = game.baseSpeed * t.speed / 100;
	}
	game.playerSpeedPct = t.speed;
	game.damageBonus = t.damage;
	game.defensePct = t.defense;
	game.accuracyPct = t.accuracy;
	if (game.playerMaxHP !== t.max_hp) {
		var ratio = game.playerMaxHP > 0 ? game.playerHP / game.playerMaxHP : 1;
		game.playerMaxHP = t.max_hp;
		game.playerHP = Math.round(game.playerMaxHP * ratio);
		if (game.playerHP < 1) game.playerHP = 1;
	}
	if (game.playerHP > game.playerMaxHP) game.playerHP = game.playerMaxHP;
	// экипировка из сервера доходит до рантайма только через setEquipped;
	// guard по id не пересоздаёт магазин при каждом syncState
	if (game.equippedId !== prog.equipped) game.setEquipped(prog.equipped);
	game.emitHUD();
}

export { STAT_DEFS, FOOD_HEAL, ACHIEVEMENTS, itemKind, parseProgress, applyProgress };