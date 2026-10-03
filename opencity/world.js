// Рендер мира из сгенерированных данных city.js: земля районов, вода и
// причалы, парки и дворы, дороги с тротуарами и разметкой, площадь с
// фонтаном, здания (pixel-art), городская зелень. Порядок слоёв важен:
// площадь лежит поверх магистрали, здания и зелень — поверх покрытий.

import * as PIXI from "pixi.js";
import { OC_CONFIG } from "./config.js";
import { DISTRICTS, ROADS, PLAZA, FOUNTAIN, PARKS, COURTYARDS, WATER, PIERS, BUILDINGS, GREEN } from "./city.js";
import { drawBuildingTexture, shapeWorld, doorPoint } from "./buildings.js";

function buildWorld(app, textures) {
  var container = new PIXI.Container();
  var colliders = [];
  var doorSpots = [];
  var i, j;

  var ground = new PIXI.Graphics();
  for (i = 0; i < DISTRICTS.length; i++) {
    var r = DISTRICTS[i].rect;
    ground.beginFill(DISTRICTS[i].tint);
    ground.drawRect(r.x, r.y, r.w, r.h);
    ground.endFill();
  }
  container.addChild(ground);

  for (i = 0; i < WATER.length; i++) {
    var wv = new PIXI.TilingSprite(textures.water, WATER[i].w, WATER[i].h);
    wv.position.set(WATER[i].x, WATER[i].y);
    container.addChild(wv);
    colliders.push({ x: WATER[i].x, y: WATER[i].y, w: WATER[i].w, h: WATER[i].h });
  }
  for (i = 0; i < PIERS.length; i++) {
    var pg = new PIXI.Graphics();
    pg.beginFill(0x8d6e63); pg.drawRect(PIERS[i].x, PIERS[i].y, PIERS[i].w, PIERS[i].h);
    pg.beginFill(0x6d4c41);
    for (j = PIERS[i].y; j < PIERS[i].y + PIERS[i].h; j += 40) pg.drawRect(PIERS[i].x, j, PIERS[i].w, 3);
    pg.endFill();
    container.addChild(pg);
  }

  for (i = 0; i < PARKS.length; i++) {
    var gv = new PIXI.TilingSprite(textures.grass, PARKS[i].w, PARKS[i].h);
    gv.position.set(PARKS[i].x, PARKS[i].y);
    container.addChild(gv);
  }
  for (i = 0; i < COURTYARDS.length; i++) {
    var cv = new PIXI.TilingSprite(textures.grass, COURTYARDS[i].w, COURTYARDS[i].h);
    cv.position.set(COURTYARDS[i].x, COURTYARDS[i].y);
    container.addChild(cv);
  }

  // дороги: тротуар -> асфальт -> разметка
  for (i = 0; i < ROADS.length; i++) {
    var rd = ROADS[i];
    var sg = new PIXI.Graphics();
    sg.beginFill(0xc9c2b2);
    sg.drawRect(rd.x - rd.sw, rd.y - rd.sw, rd.w + rd.sw * 2, rd.h + rd.sw * 2);
    sg.endFill();
    container.addChild(sg);
    var av = new PIXI.TilingSprite(textures.asphalt, rd.w, rd.h);
    av.position.set(rd.x, rd.y);
    container.addChild(av);
    var mk = new PIXI.Graphics();
    mk.beginFill(0xd8d3c0);
    if (rd.w > rd.h) { for (j = rd.x + 30; j < rd.x + rd.w - 30; j += 70) mk.drawRect(j, rd.y + rd.h / 2 - 2, 30, 4); }
    else { for (j = rd.y + 30; j < rd.y + rd.h - 30; j += 70) mk.drawRect(rd.x + rd.w / 2 - 2, j, 4, 30); }
    mk.endFill();
    container.addChild(mk);
  }

  // площадь поверх магистрали + фонтан
  var pv = new PIXI.TilingSprite(textures.plaza, PLAZA.w, PLAZA.h);
  pv.position.set(PLAZA.x, PLAZA.y);
  container.addChild(pv);
  var fs = new PIXI.Sprite(textures.fountain);
  fs.anchor.set(0.5);
  fs.width = FOUNTAIN.w; fs.height = FOUNTAIN.h;
  fs.position.set(FOUNTAIN.x, FOUNTAIN.y);
  container.addChild(fs);
  colliders.push({ x: FOUNTAIN.x - 60, y: FOUNTAIN.y - 60, w: 120, h: 120 });

  // здания
  var bcont = new PIXI.Container();
  for (i = 0; i < BUILDINGS.length; i++) {
    var b = BUILDINGS[i];
    var sw2 = shapeWorld(b.shape, b.rot || 0, b.x, b.y, b.w, b.h);
    var tex = drawBuildingTexture(app.renderer, b.shape, b.type, b.w, b.h);
    var spr = new PIXI.Sprite(tex);
    spr.position.set(b.x, b.y);
    bcont.addChild(spr);
    for (j = 0; j < sw2.rects.length; j++) colliders.push(sw2.rects[j]);
    var dp = doorPoint(sw2.fac, b.rot || 0);
    doorSpots.push({ id: "door." + b.id, x: dp.x, y: dp.y, name: b.name, building: b });
  }
  container.addChild(bcont);

  // зелень и городские объекты
  var deco = new PIXI.Container();
  var SIZES = { tree: [64, 64], bush: [36, 24], flower: [44, 24], lamp: [26, 60], bench: [44, 22] };
  var TEXMAP = { tree: "tree", bush: "bush", flower: "flower", lamp: "lamp", bench: "bench" };
  for (i = 0; i < GREEN.length; i++) {
    var gr = GREEN[i];
    var s = new PIXI.Sprite(textures[TEXMAP[gr.t]]);
    s.anchor.set(0.5);
    s.width = SIZES[gr.t][0]; s.height = SIZES[gr.t][1];
    s.position.set(gr.x, gr.y);
    deco.addChild(s);
  }
  container.addChild(deco);

  return { container: container, colliders: colliders, doorSpots: doorSpots };
}

export { buildWorld };