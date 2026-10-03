// Генератор города Open City: дорожные линии -> кварталы -> периметральная
// застройка. Главная магистраль горизонтальна и проходит через центральную
// площадь; вертикальные улицы идут между кварталами, часть — тупики/переулки.
// Кварталы заполняются зданиями по периметру с внутренним зелёным двором,
// поэтому город читается как настоящий, а карта совпадает с миром.

import { districtAt } from "./districts.js";

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

var WORLD_W = 9600, WORLD_H = 6400;

var BUILDING_TYPES = {
  bank: { label: "Bank", color: 0x2a3550 }, weapon_shop: { label: "Weapon Shop", color: 0x4a2a2a },
  general_shop: { label: "General Shop", color: 0x2a4a3a }, mall: { label: "Mall", color: 0x3a3a4a },
  casino: { label: "Casino", color: 0x4a3a20 }, office: { label: "Office", color: 0x26262e },
  warehouse: { label: "Warehouse", color: 0x33302a }, restaurant: { label: "Restaurant", color: 0x4a2a3a },
  apartment: { label: "Apartment", color: 0x2e2a26 }, story: { label: "Landmark", color: 0x3a2a4a }
};

var DISTRICTS = [
  { id: "downtown",   name: "Downtown",            rect: { x: 0,    y: 0,    w: 3200, h: 3200 }, tint: 0x8a8474 },
  { id: "financial",  name: "Financial District",  rect: { x: 3200, y: 0,    w: 3200, h: 3200 }, tint: 0x83868c },
  { id: "shopping",   name: "Shopping District",   rect: { x: 6400, y: 0,    w: 3200, h: 3200 }, tint: 0x8a8272 },
  { id: "industrial", name: "Industrial District", rect: { x: 0,    y: 3200, w: 3200, h: 3200 }, tint: 0x7a766c },
  { id: "oldtown",    name: "Old Town",            rect: { x: 3200, y: 3200, w: 3200, h: 3200 }, tint: 0x877d6c },
  { id: "harbor",     name: "Harbor",              rect: { x: 6400, y: 3200, w: 3200, h: 3200 }, tint: 0x6e7a84 }
];

// ---------- дорожная сеть ----------
var XS = [0, 700, 1600, 2500, 3400, 4300, 5200, 6100, 7000, 7900, 8800, 9600];
var YS = [0, 700, 1600, 2500, 3400, 4300, 5200, 6400];

var H_ROADS = [
  { y: 700,  w: 70,  kind: "street" },
  { y: 1600, w: 140, kind: "avenue" },
  { y: 2500, w: 80,  kind: "street" },
  { y: 3400, w: 100, kind: "street" },
  { y: 4300, w: 80,  kind: "street" },
  { y: 5200, w: 70,  kind: "street" }
];
// вертикали: не все сплошные — есть тупики и переулки, перекрёстки не везде
var V_ROADS = [
  { x: 700,  w: 80,  kind: "street", y0: 0,    y1: 6400 },
  { x: 1600, w: 50,  kind: "lane",   y0: 0,    y1: 1150 },
  { x: 1600, w: 80,  kind: "street", y0: 2050, y1: 6400 },
  { x: 2500, w: 80,  kind: "street", y0: 0,    y1: 6400 },
  { x: 3400, w: 100, kind: "street", y0: 0,    y1: 6400 },
  { x: 4300, w: 50,  kind: "lane",   y0: 0,    y1: 2500 },
  { x: 5200, w: 80,  kind: "street", y0: 0,    y1: 6400 },
  { x: 6100, w: 50,  kind: "lane",   y0: 1600, y1: 6400 },
  { x: 7000, w: 80,  kind: "street", y0: 0,    y1: 6400 },
  { x: 7900, w: 50,  kind: "lane",   y0: 3400, y1: 6400 },
  { x: 8800, w: 80,  kind: "street", y0: 0,    y1: 6400 }
];

var ROADS = [];
var i;
for (i = 0; i < H_ROADS.length; i++) {
  var hr = H_ROADS[i];
  ROADS.push({ x: 0, y: hr.y - hr.w / 2, w: WORLD_W, h: hr.w, kind: hr.kind, sw: hr.kind === "avenue" ? 30 : 20 });
}
for (i = 0; i < V_ROADS.length; i++) {
  var vr = V_ROADS[i];
  ROADS.push({ x: vr.x - vr.w / 2, y: vr.y0, w: vr.w, h: vr.y1 - vr.y0, kind: vr.kind, sw: vr.kind === "lane" ? 12 : 20 });
}

// ---------- площадь, вода, парки ----------
var PLAZA = { x: 1150, y: 1150, w: 900, h: 900 };
var FOUNTAIN = { x: 1600, y: 1600, w: 200, h: 200 };
var WATER = [ { x: 6400, y: 5600, w: 3200, h: 800 } ];
var PIERS = [
  { x: 6800, y: 5600, w: 120, h: 600 },
  { x: 7600, y: 5600, w: 120, h: 760 },
  { x: 8500, y: 5600, w: 120, h: 520 }
];

// ---------- генерация кварталов ----------
var SHAPE_IDS = ["box","wide","narrow","Lleft","Lright","Lback","Tshape","chamTL","chamTR","chamBL","chamBR","bayFront","wingL","wingR","stepped","zigzag","slabStep","notchFront","offset"];
var DISTRICT_TYPES = {
  downtown:   ["apartment","restaurant","general_shop","office","apartment"],
  financial:  ["office","office","bank","office","casino"],
  shopping:   ["general_shop","general_shop","restaurant","mall","general_shop"],
  industrial: ["warehouse","warehouse","warehouse","warehouse"],
  oldtown:    ["apartment","apartment","restaurant","apartment","general_shop"],
  harbor:     ["warehouse","warehouse","office","warehouse"]
};

var LANDMARKS = {
  "2,1": { type: "story",        shape: "Ushape",  rot: 0,   name: "City Hall",     behavior: "story", storyText: "building.cityhall" },
  "4,2": { type: "bank",         shape: "chamTL",  rot: 0,   name: "First Bank",    behavior: "interior", interior: "int_bank" },
  "5,2": { type: "bank",         shape: "chamTR",  rot: 0,   name: "Union Bank",    behavior: "ui" },
  "8,1": { type: "mall",         shape: "Ushape",  rot: 180, name: "City Mall",     behavior: "ui" },
  "7,2": { type: "weapon_shop",  shape: "box",     rot: 0,   name: "Gun Store",     behavior: "interior", interior: "int_weaponshop" },
  "1,5": { type: "story",        shape: "zigzag",  rot: 0,   name: "Old Factory",   behavior: "story", storyText: "building.factory" },
  "5,4": { type: "story",        shape: "Tshape",  rot: 0,   name: "Old Chapel",    behavior: "story", storyText: "building.chapel" },
  "6,5": { type: "office",       shape: "box",     rot: 0,   name: "Port Office",   behavior: "ui" },
  "8,5": { type: "story",        shape: "Tshape",  rot: 180, name: "Cargo Dock",    behavior: "story", storyText: "building.dock" }
};
var PARK_CELLS = { "3,1": 1, "9,3": 1, "2,4": 1, "10,1": 1, "4,6": 1 };

var BUILDINGS = [];
var PARKS = [];
var COURTYARDS = [];
var GREEN = [];
var POIS = [];
var rng = mulberry32(20261003);

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function pushGreen(t, x, y) { GREEN.push({ t: t, x: x, y: y }); }

// зелень вдоль тротуаров каждой дороги
function streetGreenery() {
  var j, R;
  for (j = 0; j < ROADS.length; j++) {
    R = ROADS[j];
    if (R.w > R.h) {
      for (var x = R.x + 140; x < R.x + R.w - 140; x += 220) {
        pushGreen("lamp", x, R.y - R.sw - 16);
        pushGreen((x / 220) % 2 < 1 ? "tree" : "bush", x + 110, R.y - R.sw - 22);
        pushGreen((x / 220) % 2 < 1 ? "bush" : "tree", x + 60, R.y + R.h + R.sw + 22);
        if ((x / 220) % 3 === 0) pushGreen("flower", x + 160, R.y + R.h + R.sw + 16);
      }
    } else {
      for (var y = R.y + 140; y < R.y + R.h - 140; y += 220) {
        pushGreen("lamp", R.x - R.sw - 16, y);
        pushGreen((y / 220) % 2 < 1 ? "tree" : "bush", R.x - R.sw - 22, y + 110);
        pushGreen((y / 220) % 2 < 1 ? "bush" : "tree", R.x + R.w + R.sw + 22, y + 60);
        if ((y / 220) % 3 === 0) pushGreen("flower", R.x + R.w + R.sw + 16, y + 160);
      }
    }
  }
  // обрамление площади
  for (j = PLAZA.x + 70; j < PLAZA.x + PLAZA.w - 70; j += 150) {
    pushGreen("bench", j, PLAZA.y + 46);
    pushGreen("flower", j + 70, PLAZA.y + 46);
    pushGreen("bench", j, PLAZA.y + PLAZA.h - 46);
    pushGreen("flower", j + 70, PLAZA.y + PLAZA.h - 46);
  }
  for (j = PLAZA.y + 70; j < PLAZA.y + PLAZA.h - 70; j += 150) {
    pushGreen("lamp", PLAZA.x + 46, j);
    pushGreen("tree", PLAZA.x + 100, j + 70);
    pushGreen("lamp", PLAZA.x + PLAZA.w - 46, j);
    pushGreen("tree", PLAZA.x + PLAZA.w - 100, j + 70);
  }
}

function fillBlock(cell, district, gx, gy) {
  var types = DISTRICT_TYPES[district] || DISTRICT_TYPES.downtown;
  var small = district === "oldtown";
  var big = district === "industrial" || district === "harbor";
  var minW = small ? 120 : (big ? 300 : 170);
  var maxW = small ? 200 : (big ? 520 : 340);
  var depth = small ? 150 : (big ? 260 : 200);
  var x, w;

  // верхний и нижний ряды вдоль улиц
  x = cell.x + 8;
  while (x < cell.x + cell.w - minW) {
    w = Math.min(maxW, cell.x + cell.w - 8 - x);
    if (w < minW) break;
    BUILDINGS.push(mk(gx + "." + gy + ".t" + Math.round(x), district, types[Math.floor(rng() * types.length)],
      SHAPE_IDS[Math.floor(rng() * SHAPE_IDS.length)], 180, x, cell.y, w, depth));
    x += w + 10 + Math.floor(rng() * 26);
  }
  x = cell.x + 8;
  while (x < cell.x + cell.w - minW) {
    w = Math.min(maxW, cell.x + cell.w - 8 - x);
    if (w < minW) break;
    BUILDINGS.push(mk(gx + "." + gy + ".b" + Math.round(x), district, types[Math.floor(rng() * types.length)],
      SHAPE_IDS[Math.floor(rng() * SHAPE_IDS.length)], 0, x, cell.y + cell.h - depth, w, depth));
    x += w + 10 + Math.floor(rng() * 26);
  }
  // внутренний двор — зелень
  var cy = cell.y + depth + 16;
  var ch = cell.h - depth * 2 - 32;
  if (ch > 60) {
    COURTYARDS.push({ x: cell.x + 20, y: cy, w: cell.w - 40, h: ch });
    for (var k = 0; k < Math.max(2, Math.floor(cell.w / 220)); k++) {
      pushGreen("tree", cell.x + 60 + rng() * (cell.w - 120), cy + 20 + rng() * (ch - 40));
      pushGreen("bush", cell.x + 60 + rng() * (cell.w - 120), cy + 20 + rng() * (ch - 40));
    }
  }
}

function mk(id, district, type, shape, rot, x, y, w, h) {
  return { id: id, district: district, type: type, shape: shape, rot: rot, x: x, y: y, w: w, h: h, behavior: "ui", name: typeLabel(type) };
}
function typeLabel(type) { return (BUILDING_TYPES[type] || {}).label || "Building"; }

function generate() {
  var gx, gy;
  for (gx = 0; gx < XS.length - 1; gx++) {
    for (gy = 0; gy < YS.length - 1; gy++) {
      var cell = { x: XS[gx] + 70, y: YS[gy] + 70, w: XS[gx + 1] - XS[gx] - 140, h: YS[gy + 1] - YS[gy] - 140 };
      if (cell.w < 140 || cell.h < 140) continue;
      if (overlaps(cell, PLAZA)) continue;
      // вода Harbor
      if (cell.x >= 6400 && cell.y >= 5200) continue;
      var key = gx + "," + gy;
      if (PARK_CELLS[key]) { PARKS.push(cell); for (var p = 0; p < 16; p++) pushGreen("tree", cell.x + 40 + rng() * (cell.w - 80), cell.y + 40 + rng() * (cell.h - 80)); continue; }
      var lm = LANDMARKS[key];
      var d = districtAt(cell.x + cell.w / 2, cell.y + cell.h / 2);
      var did = d ? d.id : "downtown";
      if (lm) {
        var b = mk("b." + key, did, lm.type, lm.shape, lm.rot, cell.x, cell.y, cell.w, cell.h);
        b.name = lm.name; b.behavior = lm.behavior; b.storyText = lm.storyText; b.interior = lm.interior;
        BUILDINGS.push(b);
        POIS.push({ id: "poi." + key, district: did, name: lm.name, x: cell.x + cell.w / 2, y: cell.y + cell.h / 2, requiresDistrict: did, requiresEvent: null });
        continue;
      }
      fillBlock(cell, did, gx, gy);
    }
  }
  POIS.unshift({ id: "poi.plaza", district: "downtown", name: "Central Plaza", x: FOUNTAIN.x, y: FOUNTAIN.y, requiresDistrict: null, requiresEvent: null });
  streetGreenery();
}
generate();

var INTERIORS = {
  int_bank: { id: "int_bank", name: "First Bank", w: 560, h: 400, spawn: { x: 280, y: 340 }, exit: { x: 280, y: 368 },
    objects: [ { x: 180, y: 120, w: 200, h: 44, color: 0x2a3550 }, { x: 240, y: 40, w: 90, h: 60, color: 0x3a4a6a } ],
    npcs: [ { id: "npc.teller", name: "Teller Ana", x: 280, y: 96, lines: ["npc.teller.greet", "npc.teller.2"] } ] },
  int_weaponshop: { id: "int_weaponshop", name: "Gun Store", w: 440, h: 340, spawn: { x: 220, y: 280 }, exit: { x: 220, y: 308 },
    objects: [ { x: 60, y: 60, w: 140, h: 40, color: 0x4a2a2a }, { x: 240, y: 60, w: 140, h: 40, color: 0x4a2a2a } ],
    npcs: [ { id: "npc.gunsmith", name: "Gunsmith Vera", x: 220, y: 140, lines: ["npc.gunsmith.greet"] } ] },
  int_apartment: { id: "int_apartment", name: "Apartment", w: 400, h: 320, spawn: { x: 200, y: 260 }, exit: { x: 200, y: 288 },
    objects: [ { x: 60, y: 60, w: 120, h: 60, color: 0x2e2a26 }, { x: 240, y: 60, w: 100, h: 50, color: 0x2e2a26 } ],
    npcs: [] }
};

function buildingById(id) { for (var k = 0; k < BUILDINGS.length; k++) if (BUILDINGS[k].id === id) return BUILDINGS[k]; return null; }
function getInterior(id) { return INTERIORS[id] || null; }

export { BUILDING_TYPES, DISTRICTS, ROADS, PLAZA, FOUNTAIN, PARKS, COURTYARDS, WATER, PIERS, BUILDINGS, POIS, GREEN, INTERIORS, districtAt, buildingById, getInterior };