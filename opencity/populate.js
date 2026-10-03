// Наполнение внешнего мира: NPC по районам, двери зданий из city.js
// (с поведением interior/ui/story), предметы на земле. Включая пистолет —
// без него цепочка «поднять -> экипировать» не стартует.
// Возвращает массив созданных сущностей, чтобы game.js мог снимать их
// при входе в интерьер и возвращать при выходе.

import * as PIXI from "pixi.js";
import { Entity, DialogDef } from "./entities.js";

var NPC_DEFS = [
  { id: "mayor",    name: "Mayor Cole",    x: 800,  y: 742,  lines: ["npc.mayor.greet", "npc.mayor.2"] },
  { id: "mechanic", name: "Mechanic Rosa", x: 616,  y: 806,  lines: ["npc.mechanic.greet", "npc.mechanic.2"] },
  { id: "dealer",   name: "Dealer Slim",   x: 986,  y: 860,  lines: ["npc.dealer.greet", "npc.dealer.2"] },
  { id: "broker",   name: "Broker Dee",    x: 2000, y: 620,  lines: ["npc.broker.greet"] },
  { id: "clerk",    name: "Clerk Mo",      x: 3640, y: 660,  lines: ["npc.clerk.greet"] },
  { id: "foreman",  name: "Foreman Gus",   x: 450,  y: 2680, lines: ["npc.foreman.greet"] },
  { id: "elder",    name: "Elder Nia",     x: 2370, y: 2370, lines: ["npc.elder.greet"] },
  { id: "docker",   name: "Docker Ray",    x: 3990, y: 2590, lines: ["npc.docker.greet"] }
];

var ITEM_DEFS = [
  { id: "it.pistol.1",  itemId: "pistol",      name: "Pistol",      x: 830,  y: 840,  tint: 0xffd60a },
  { id: "it.scrap.1",   itemId: "scrap_metal", name: "Scrap Metal", x: 742,  y: 852,  tint: 0x9aa0a6 },
  { id: "it.soda.1",    itemId: "soda_can",    name: "Soda Can",    x: 866,  y: 730,  tint: 0xff6b6b },
  { id: "it.circuit.1", itemId: "old_circuit", name: "Old Circuit", x: 910,  y: 930,  tint: 0x8ab4ff },
  { id: "it.pie.1",     itemId: "apple_pie",   name: "Apple Pie",   x: 700,  y: 700,  tint: 0xe08e3c },
  { id: "it.ammo.1",    itemId: "pistol_ammo", name: "Pistol Ammo", x: 900,  y: 700,  tint: 0xcfd66a },
  { id: "it.ammo.2",    itemId: "pistol_ammo", name: "Pistol Ammo", x: 3560, y: 1100, tint: 0xcfd66a },
  { id: "it.scrap.2",   itemId: "scrap_metal", name: "Scrap Metal", x: 410,  y: 2100, tint: 0x9aa0a6 }
];

var nameStyle = null;
function getNameStyle() {
  if (!nameStyle) {
    nameStyle = new PIXI.TextStyle({
      fontFamily: "Inter, -apple-system, sans-serif",
      fontSize: 11, fontWeight: "600", fill: 0xcfcfd6
    });
  }
  return nameStyle;
}

function createNPC(def, textures, world) {
  var container = new PIXI.Container();
  var body = new PIXI.Sprite(textures.npcBody);
  body.anchor.set(0.5);
  var label = new PIXI.Text(def.name, getNameStyle());
  label.anchor.set(0.5, 1);
  label.position.set(0, -17);
  container.addChild(body);
  container.addChild(label);
  container.position.set(def.x, def.y);
  world.addChild(container);

  var npc = new Entity({
    id: def.id, type: "npc", name: def.name,
    x: def.x, y: def.y, radius: 52, verb: "Talk",
    container: container,
    data: { dialog: new DialogDef({ id: "dlg." + def.id, lines: def.lines }) }
  });
  npc.onInteract = function (game) { game.openDialog(npc); };
  return npc;
}

// дверь здания: поведение берём из каталога (interior/ui/story)
function createDoor(spot, textures, world) {
  var spr = new PIXI.Sprite(textures.door);
  spr.anchor.set(0.5, 1);
  spr.position.set(spot.x, spot.y);
  world.addChild(spr);

  var b = spot.building;
  var door = new Entity({
    id: spot.id, type: "door", name: spot.name,
    x: spot.x, y: spot.y - 17, radius: 58, verb: "Enter",
    container: spr,
    data: { building: b, interior: b ? b.interior : null }
  });
  door.onInteract = function (game) {
    if (!b) { game.openBuilding(door); return; }
    if (b.behavior === "interior") game.enterInterior(door);
    else if (b.behavior === "story") game.openStory(door);
    else game.openBuilding(door);
  };
  return door;
}

function createGroundItem(def, textures, world) {
  var spr = new PIXI.Sprite(textures.itemBox);
  spr.anchor.set(0.5);
  spr.tint = def.tint;
  spr.position.set(def.x, def.y);
  world.addChild(spr);

  var item = new Entity({
    id: def.id, type: "item", name: def.name,
    x: def.x, y: def.y, radius: 44, verb: "Pick Up",
    container: spr,
    data: { itemId: def.itemId, qty: 1 }
  });
  item.onInteract = function (game) { game.pickUp(item); };
  return item;
}

function populateWorld(world, textures, interactions, doorSpots) {
  var entities = [];
  var i;
  for (i = 0; i < NPC_DEFS.length; i++) {
    var n = createNPC(NPC_DEFS[i], textures, world);
    interactions.register(n); entities.push(n);
  }
  for (i = 0; i < doorSpots.length; i++) {
    var d = createDoor(doorSpots[i], textures, world);
    interactions.register(d); entities.push(d);
  }
  for (i = 0; i < ITEM_DEFS.length; i++) {
    var it = createGroundItem(ITEM_DEFS[i], textures, world);
    interactions.register(it); entities.push(it);
  }
  return entities;
}

export { populateWorld };