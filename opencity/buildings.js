// Силуэты зданий (22 плана) + генератор pixel-art текстуры: крыша с
// парапетом/вентами/кондиционерами, фасад с вывеской, витринами,
// маркизой, дверью и цоколем, боковая тень. Фасад занимает нижнюю
// треть, крыша — верхние две трети, как в top-down референсе.

import { makeCanvas, canvasToTexture } from "./pixels.js";

var SHAPES = {
  box:        { r: [[0,0,100,100]], f: [[0,86,100,14]] },
  wide:       { r: [[0,25,100,75]], f: [[0,86,100,14]] },
  narrow:     { r: [[30,0,40,100]], f: [[30,86,40,14]] },
  Lleft:      { r: [[0,0,50,100],[50,55,50,45]], f: [[0,86,100,14]] },
  Lright:     { r: [[50,0,50,100],[0,55,50,45]], f: [[0,86,100,14]] },
  Lback:      { r: [[0,0,100,50],[0,50,45,50]], f: [[0,86,45,14]] },
  Tshape:     { r: [[0,0,100,45],[30,45,40,55]], f: [[30,86,40,14]] },
  Ushape:     { r: [[0,0,30,100],[70,0,30,100],[0,0,100,45]], f: [[0,86,30,14],[70,86,30,14]] },
  chamTL:     { r: [[15,0,85,100],[0,15,15,85]], f: [[0,86,100,14]] },
  chamTR:     { r: [[0,0,85,100],[85,15,15,85]], f: [[0,86,100,14]] },
  chamBL:     { r: [[0,0,100,85],[15,85,85,15]], f: [[15,86,85,14]] },
  chamBR:     { r: [[0,0,100,85],[0,85,85,15]], f: [[0,86,85,14]] },
  bayFront:   { r: [[0,0,100,86],[30,86,40,14]], f: [[30,86,40,14]] },
  wingL:      { r: [[20,0,80,100],[0,30,20,40]], f: [[20,86,80,14]] },
  wingR:      { r: [[0,0,80,100],[80,30,20,40]], f: [[0,86,80,14]] },
  stepped:    { r: [[0,0,100,60],[10,60,80,40]], f: [[10,86,80,14]] },
  zigzag:     { r: [[0,0,50,100],[50,20,50,80]], f: [[0,86,100,14]] },
  twin:       { r: [[0,0,42,100],[58,0,42,100]], f: [[0,86,42,14],[58,86,42,14]] },
  arcade:     { r: [[0,0,100,86],[0,86,25,14],[75,86,25,14]], f: [[0,86,25,14],[75,86,25,14]] },
  slabStep:   { r: [[0,0,100,40],[10,40,80,30],[20,70,60,30]], f: [[20,86,60,14]] },
  notchFront: { r: [[0,0,45,100],[55,0,45,100],[0,0,100,40]], f: [[0,86,45,14],[55,86,45,14]] },
  offset:     { r: [[0,10,70,90],[30,0,70,90]], f: [[30,86,70,14]] }
};

var TYPE_PAL = {
  bank:         { wall: "#e6e0d2", roof: "#7b8494", sign: "#1f3a5f", awn: "#1f3a5f", glass: "#bfe3f2" },
  weapon_shop:  { wall: "#c05a50", roof: "#54463f", sign: "#7f1d1d", awn: "#3f3f46", glass: "#ffd7b0" },
  general_shop: { wall: "#e8bd63", roof: "#5f5a52", sign: "#166534", awn: "#166534", glass: "#d6f0e0" },
  mall:         { wall: "#dfe6ee", roof: "#6d7a89", sign: "#0e7490", awn: "#0e7490", glass: "#cfeaf2" },
  casino:       { wall: "#d09a4a", roof: "#5f5a52", sign: "#7c2d12", awn: "#7c2d12", glass: "#ffe9b0" },
  office:       { wall: "#aebfd0", roof: "#4d5866", sign: "#334155", awn: "#334155", glass: "#cfe3f2" },
  warehouse:    { wall: "#b3aca4", roof: "#7d766c", sign: "#57534e", awn: "#57534e", glass: "#d8d3c8" },
  restaurant:   { wall: "#e58a6d", roof: "#77564a", sign: "#9d2235", awn: "#9d2235", glass: "#ffe3c4" },
  apartment:    { wall: "#e2d2b0", roof: "#84735f", sign: "#6b7280", awn: "#8d6e63", glass: "#dcecf2" },
  story:        { wall: "#d6c49c", roof: "#5f5a52", sign: "#3f3f46", awn: "#3f3f46", glass: "#e8e2d0" }
};

function shade(hex, f) {
  var n = parseInt(hex.slice(1), 16);
  var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.max(0, Math.min(255, Math.round(r * f)));
  g = Math.max(0, Math.min(255, Math.round(g * f)));
  b = Math.max(0, Math.min(255, Math.round(b * f)));
  return "rgb(" + r + "," + g + "," + b + ")";
}

var cache = {};

function drawBuildingTexture(renderer, shapeId, type, W, H) {
  var key = shapeId + "|" + type + "|" + W + "|" + H;
  if (cache[key]) return cache[key];
  var sh = SHAPES[shapeId] || SHAPES.box;
  var pal = TYPE_PAL[type] || TYPE_PAL.office;
  var kx = W / 100, ky = H / 100;
  var c = makeCanvas(W, H);
  var g = c.getContext("2d");
  var i, r;

  // крыши
  for (i = 0; i < sh.r.length; i++) {
    r = sh.r[i];
    var rx = Math.round(r[0] * kx), ry = Math.round(r[1] * ky);
    var rw = Math.round(r[2] * kx), rh = Math.round(r[3] * ky);
    g.fillStyle = shade(pal.roof, 0.7); g.fillRect(rx, ry, rw, rh);
    g.fillStyle = pal.roof; g.fillRect(rx + 2, ry + 2, rw - 4, rh - 4);
    g.fillStyle = shade(pal.roof, 1.16);
    for (var ly = ry + 6; ly < ry + rh - 8; ly += 7) g.fillRect(rx + 4, ly, rw - 8, 1);
    g.fillStyle = shade(pal.roof, 1.4);
    g.fillRect(rx + 6, ry + 6, 7, 5);
    g.fillRect(rx + rw - 14, ry + rh - 14, 8, 6);
    g.fillStyle = shade(pal.roof, 0.55);
    g.fillRect(Math.round(rx + rw / 2) - 3, Math.round(ry + rh / 2) - 3, 6, 6);
  }

  // фасады: стена, вывеска, витрины, маркиза, дверь, цоколь, тень
  for (i = 0; i < sh.f.length; i++) {
    var f = sh.f[i];
    var fx = Math.round(f[0] * kx), fw = Math.round(f[2] * kx);
    var top = Math.round(66 * ky), bot = Math.round(100 * ky);
    var fh = bot - top;
    g.fillStyle = shade(pal.wall, 0.66); g.fillRect(fx, top, fw, fh);
    g.fillStyle = pal.wall; g.fillRect(fx + 1, top + 1, fw - 2, fh - 2);
    g.fillStyle = shade(pal.wall, 0.85); g.fillRect(fx + 1, top + 1, 3, fh - 2); // боковая тень
    // вывеска
    g.fillStyle = pal.sign; g.fillRect(fx + 3, top + 3, fw - 6, 6);
    g.fillStyle = shade(pal.sign, 1.7);
    for (var sx = fx + 6; sx < fx + fw - 8; sx += 7) g.fillRect(sx, top + 4, 4, 4);
    // витрины
    g.fillStyle = pal.glass;
    for (var wx = fx + 4; wx < fx + fw - 8; wx += 10) g.fillRect(wx, top + 12, 7, 7);
    g.fillStyle = "#ffffff";
    for (wx = fx + 4; wx < fx + fw - 8; wx += 10) g.fillRect(wx, top + 12, 2, 3);
    // маркиза
    g.fillStyle = pal.awn;
    for (wx = fx + 3; wx < fx + fw - 3; wx += 7) g.fillRect(wx, top + 10, 4, 2);
    // дверь + цоколь
    g.fillStyle = "#3b2f2a"; g.fillRect(fx + fw / 2 - 4, bot - 12, 8, 12);
    g.fillStyle = pal.glass; g.fillRect(fx + fw / 2 - 3, bot - 11, 6, 6);
    g.fillStyle = shade(pal.wall, 0.6); g.fillRect(fx + 1, bot - 3, fw - 2, 3);
  }

  var t = canvasToTexture(renderer, c);
  cache[key] = t;
  return t;
}

function rotRect(r, rot) {
  var x = r[0], y = r[1], w = r[2], h = r[3];
  if (rot === 90)  return [100 - y - h, x, h, w];
  if (rot === 180) return [100 - x - w, 100 - y - h, w, h];
  if (rot === 270) return [y, 100 - x - w, h, w];
  return [x, y, w, h];
}

function shapeWorld(shapeId, rot, x, y, W, H) {
  var sh = SHAPES[shapeId] || SHAPES.box;
  var rects = [], fac = [], i;
  for (i = 0; i < sh.r.length; i++) {
    var r = rotRect(sh.r[i], rot);
    rects.push({ x: x + r[0] / 100 * W, y: y + r[1] / 100 * H, w: r[2] / 100 * W, h: r[3] / 100 * H });
  }
  for (i = 0; i < sh.f.length; i++) {
    var f = rotRect(sh.f[i], rot);
    fac.push({ x: x + f[0] / 100 * W, y: y + f[1] / 100 * H, w: f[2] / 100 * W, h: f[3] / 100 * H });
  }
  return { rects: rects, fac: fac };
}

function doorPoint(fac, rot) {
  var s = fac[0];
  if (rot === 90)  return { x: s.x, y: s.y + s.h / 2 };
  if (rot === 180) return { x: s.x + s.w / 2, y: s.y };
  if (rot === 270) return { x: s.x + s.w, y: s.y + s.h / 2 };
  return { x: s.x + s.w / 2, y: s.y + s.h };
}

export { SHAPES, TYPE_PAL, drawBuildingTexture, shapeWorld, doorPoint };