// Пиксель-арт ядро Open City: рисуем спрайты посимвольными картами
// (строки = ряды пикселей) в offscreen-canvas и отдаём PIXI-текстуры
// с NEAREST-масштабом. Никаких кругов/заглушек — только пиксель-арт.

import * as PIXI from "pixi.js";

function makeCanvas(w, h) {
  var c = document.createElement("canvas");
  c.width = w; c.height = h;
  return c;
}

function textureFromCanvas(renderer, canvas, scale) {
  var t = PIXI.Texture.from(canvas);
  t.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  t.baseTexture.resolution = 1;
  if (scale && scale !== 1) {
    // текстура рисуется в 1x, масштаб спрайта задаёт caller
  }
  return t;
}

// rows: массив строк одинаковой длины; palette: char -> "#rrggbb" | null(прозрачно)
function mapToCanvas(rows, palette) {
  var h = rows.length, w = rows[0].length;
  var c = makeCanvas(w, h);
  var ctx = c.getContext("2d");
  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var col = palette[rows[y][x]];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return c;
}

function canvasToTexture(renderer, canvas) {
  var t = PIXI.Texture.from(canvas);
  t.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  return t;
}

function mapToTexture(renderer, rows, palette) {
  return canvasToTexture(renderer, mapToCanvas(rows, palette));
}

// персонаж: тело 12x12 + ноги 12x4, собираем кадры направления/шага
var BODY_DOWN = [
  "....OOOO....",
  "...OHHHHO...",
  "..OHHHHHHO..",
  "..OHSSSSHO..",
  "..OHSESEHO..",
  "..OSSSSSSO..",
  "...OSSSSO...",
  "..OJJJJJJO..",
  ".OJJJJJJJJO.",
  ".OJAJJJJAJO.",
  ".OJJJJJJJJO.",
  "..OJJJJJJO.."
];
var BODY_UP = [
  "....OOOO....",
  "...OHHHHO...",
  "..OHHHHHHO..",
  "..OHHHHHHO..",
  "..OHHHHHHO..",
  "..OHHHHHHO..",
  "...OHHHHO...",
  "..OJJJJJJO..",
  ".OJJJJJJJJO.",
  ".OJAJJJJAJO.",
  ".OJJJJJJJJO.",
  "..OJJJJJJO.."
];
var BODY_SIDE = [
  "....OOOO....",
  "...OHHHHO...",
  "..OHHHHHHO..",
  "..OHHSSSHO..",
  "..OHHSESHO..",
  "..OHHSSSHO..",
  "...OHHSSO...",
  "..OJJJJJJO..",
  ".OJJJJJJJJO.",
  ".OJAJJJJJJO.",
  ".OJJJJJJJJO.",
  "..OJJJJJJO.."
];
var LEGS_STAND = [
  "..OPPPPPPO..",
  "..OPP..PPO..",
  "..OPP..PPO..",
  "..OWW..WWO.."
];
var LEGS_WALK_A = [
  "..OPPPPPPO..",
  "..OPP..PPO..",
  ".OPPP..PPPO.",
  ".OWW....WWO."
];
var LEGS_WALK_B = [
  "..OPPPPPPO..",
  "...OPPPPO...",
  "...OPP.PPO..",
  "...OWW.WWO.."
];

function charFrames(renderer, jacket, hair) {
  var pal = {
    O: "#101418", H: hair, S: "#e8b98a", E: "#101418",
    J: jacket, A: "#d9a441", P: "#263238", W: "#eceff1", ".": null
  };
  var bodies = { down: BODY_DOWN, up: BODY_UP, side: BODY_SIDE };
  var legs = { stand: LEGS_STAND, a: LEGS_WALK_A, b: LEGS_WALK_B };
  var out = {};
  Object.keys(bodies).forEach(function (dir) {
    out[dir] = {};
    Object.keys(legs).forEach(function (lg) {
      var rows = bodies[dir].concat(legs[lg]);
      out[dir][lg] = mapToTexture(renderer, rows, pal);
    });
  });
  return out;
}

export { makeCanvas, mapToCanvas, canvasToTexture, mapToTexture, charFrames };