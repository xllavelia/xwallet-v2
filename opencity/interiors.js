// Построение интерьеров из каталога INTERIORS (city.js): пол, стены-коллизии,
// объекты-коллизии, дверь выхода и NPC. Интерьер — отдельный контейнер,
// который game.js подменяет вместо внешнего мира на время пребывания внутри.

import * as PIXI from "pixi.js";
import { Entity, DialogDef } from "./entities.js";

var WALL = 20;
var labelStyle = null;
function getLabelStyle() {
  if (!labelStyle) {
    labelStyle = new PIXI.TextStyle({
      fontFamily: "Unbounded",
      fontSize: 11, fontWeight: "600", fill: 0xcfcfd6
    });
  }
  return labelStyle;
}

function createInteriorNPC(def, textures, container) {
  var nc = new PIXI.Container();
  var body = new PIXI.Sprite(textures.npcBody);
  body.anchor.set(0.5);
  var label = new PIXI.Text(def.name, getLabelStyle());
  label.anchor.set(0.5, 1);
  label.position.set(0, -17);
  nc.addChild(body);
  nc.addChild(label);
  nc.position.set(def.x, def.y);
  container.addChild(nc);

  var ent = new Entity({
    id: def.id, type: "npc", name: def.name,
    x: def.x, y: def.y, radius: 52, verb: "Talk",
    container: nc,
    data: { dialog: new DialogDef({ id: "dlg." + def.id, lines: def.lines || [] }) }
  });
  ent.onInteract = function (game) { game.openDialog(ent); };
  return ent;
}

function buildInterior(def, textures) {
  var container = new PIXI.Container();
  var colliders = [];
  var entities = [];
  var i;

  var g = new PIXI.Graphics();
  g.beginFill(0x1a1a1d); g.drawRect(0, 0, def.w, def.h); g.endFill();
  g.beginFill(0x26262b);
  g.drawRect(0, 0, def.w, WALL);
  g.drawRect(0, def.h - WALL, def.w, WALL);
  g.drawRect(0, 0, WALL, def.h);
  g.drawRect(def.w - WALL, 0, WALL, def.h);
  g.endFill();
  container.addChild(g);
  colliders.push({ x: 0, y: 0, w: def.w, h: WALL });
  colliders.push({ x: 0, y: def.h - WALL, w: def.w, h: WALL });
  colliders.push({ x: 0, y: 0, w: WALL, h: def.h });
  colliders.push({ x: def.w - WALL, y: 0, w: WALL, h: def.h });

  for (i = 0; i < (def.objects || []).length; i++) {
    var o = def.objects[i];
    var og = new PIXI.Graphics();
    og.beginFill(o.color || 0x26262b);
    og.drawRect(o.x, o.y, o.w, o.h);
    og.endFill();
    container.addChild(og);
    colliders.push({ x: o.x, y: o.y, w: o.w, h: o.h });
  }

  var ex = new PIXI.Sprite(textures.door);
  ex.anchor.set(0.5, 1);
  ex.position.set(def.exit.x, def.exit.y);
  container.addChild(ex);
  var exitEnt = new Entity({
    id: def.id + ".exit", type: "door", name: "Exit",
    x: def.exit.x, y: def.exit.y - 17, radius: 56, verb: "Exit",
    container: ex, data: {}
  });
  exitEnt.onInteract = function (game) { game.exitInterior(); };
  entities.push(exitEnt);

  for (i = 0; i < (def.npcs || []).length; i++) {
    entities.push(createInteriorNPC(def.npcs[i], textures, container));
  }

  return { container: container, colliders: colliders, entities: entities };
}

export { buildInterior };