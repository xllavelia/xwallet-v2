// Базовые pixel-art текстуры Open City: покрытия, зелень, городские
// объекты, фонтан, двери/ящики и персонажи. Карты рисуются посимвольно
// (pixels.js), масштаб NEAREST. Никаких геометрических заглушек.

import * as PIXI from "pixi.js";
import { mapToTexture, charFrames } from "./pixels.js";

function makeCanvas(w, h) {
  var c = document.createElement("canvas");
  c.width = w; c.height = h;
  return c;
}
function canvasTex(renderer, c) {
  var t = PIXI.Texture.from(c);
  t.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  return t;
}

// фонтан: рисуем пиксельными блоками 4px (чаща, вода, колонна, струи)
function drawFountain(renderer) {
  var P = 4, S = 96;
  var c = makeCanvas(S, S);
  var g = c.getContext("2d");
  function px(x, y, w, h, col) { g.fillStyle = col; g.fillRect(x * P, y * P, w * P, h * P); }
  // каменная чаша октагон
  px(8, 4, 8, 2, "#9aa0a6"); px(4, 6, 16, 2, "#9aa0a6");
  px(2, 8, 20, 8, "#9aa0a6"); px(4, 16, 16, 2, "#9aa0a6"); px(8, 18, 8, 2, "#9aa0a6");
  px(3, 9, 18, 6, "#cfd6da");
  // вода
  px(4, 10, 16, 4, "#2f7fb8");
  px(6, 10, 3, 1, "#6fc0e8"); px(13, 11, 4, 1, "#6fc0e8"); px(8, 12, 3, 1, "#6fc0e8");
  // центральная колонна
  px(11, 6, 2, 6, "#b9c2c7"); px(10, 4, 4, 2, "#e8edf0");
  // струи
  px(9, 6, 1, 4, "#6fc0e8"); px(14, 6, 1, 4, "#6fc0e8");
  px(8, 9, 1, 2, "#bfe8f7"); px(15, 9, 1, 2, "#bfe8f7");
  // основание
  px(10, 14, 4, 2, "#b9c2c7");
  return canvasTex(renderer, c);
}

function makePlaceholderTextures(app) {
  var renderer = app.renderer;
  var t = {};

  t.asphalt = mapToTexture(renderer, [
    "aaaaaaaaaaaaaaaa",
    "aaabaaaaaaaaacaa",
    "aaaaaaaaaaaaaaaa",
    "aaaaacaaaaabaaaa",
    "aaaaaaaaaaaaaaaa",
    "abaaaaaaaaaacaaa",
    "aaaaaaaaaaaaaaaa",
    "aaaaabaaaaaaaaaa",
    "aaaaaaaaacaaaaaa",
    "aaabaaaaaaaaaaaa",
    "aaaaaaaaaaaaaaaa",
    "aaaaaacaaaabaaaa",
    "aaaaaaaaaaaaaaaa",
    "abaaaaaaaaaaaaaa",
    "aaaaaaaaaaaaaaaa",
    "aaaaabaaaaaaaaaa"
  ], { a: "#3a3d42", b: "#43464c", c: "#33363b" });

  t.sidewalk = mapToTexture(renderer, [
    "pppppppsppppppps",
    "pppppppsppppppps",
    "pppppppsppppppps",
    "ppqppppsppqpppps",
    "pppppppsppppppps",
    "pppppppsppppppps",
    "pppppppsppppppps",
    "ssssssssssssssss",
    "pppppppsppppppps",
    "pppppppsppppppps",
    "pppppppsppppppps",
    "ppqppppsppqpppps",
    "pppppppsppppppps",
    "pppppppsppppppps",
    "pppppppsppppppps",
    "ssssssssssssssss"
  ], { p: "#c9c2b2", s: "#a89f8e", q: "#bdb4a2" });

  t.plaza = mapToTexture(renderer, [
    "pppppppppppppppp",
    "pppppppppppppppp",
    "ppqpppppppppqppp",
    "pppppppppppppppp",
    "pppppppppppppppp",
    "ppppppqppppppppq",
    "pppppppppppppppp",
    "ssssssssssssssss",
    "pppppppppppppppp",
    "ppppqppppppppppp",
    "pppppppppppppppp",
    "ppppppppppqppppp",
    "pppppppppppppppp",
    "ppqppppppppppppq",
    "pppppppppppppppp",
    "ssssssssssssssss"
  ], { p: "#d8d0bd", q: "#c6bda9", s: "#bfb5a0" });

  t.grass = mapToTexture(renderer, [
    "gggggggggggggggg",
    "gghggggggghggggg",
    "ggggggdggggggggg",
    "ggggggggggggghgg",
    "ghgggggggggggggg",
    "ggggggghggggdggg",
    "gggggggggggggggg",
    "ggdggggggghggggg",
    "gggggggggggggggg",
    "ggghgggggggggggh",
    "ggggggggdggggggg",
    "gggggggggggggggg",
    "ghggggggggghgggg",
    "gggggdgggggggggg",
    "gggggggggggggggg",
    "ggggggghggggdggg"
  ], { g: "#5f9e4a", h: "#6fb356", d: "#4c8f3c" });

  t.water = mapToTexture(renderer, [
    "wwwwwwwwwwwwwwww",
    "wwllwwwwwwwwwwww",
    "wwwwwwwwwwllwwww",
    "wwwwwwwwwwwwwwww",
    "wwwwwwllwwwwwwww",
    "wwwwwwwwwwwwwwlw",
    "wwwwwwwwwwwwwwww",
    "wllwwwwwwwwwwwww",
    "wwwwwwwwwwwwwwww",
    "wwwwwwwwllwwwwww",
    "wwwwwwwwwwwwwwww",
    "wwwwllwwwwwwwwww",
    "wwwwwwwwwwwwwwww",
    "wwwwwwwwwwwwllww",
    "wwwwwwwwwwwwwwww",
    "wlwwwwwwwwwwwwww"
  ], { w: "#2f7fb8", l: "#6fc0e8" });

  t.tree = mapToTexture(renderer, [
    "......dddd......",
    "....ddggggdd....",
    "...dgggggggd....",
    "..dggghgggggd...",
    ".dghggggggghgd..",
    ".dggggggggggd...",
    "dggghggggggggd..",
    "dggggggghgggd...",
    ".dggghgggggd....",
    "..dgggggggd.....",
    "...dggggd.......",
    ".....tt.........",
    ".....tt.........",
    "....tttt........",
    "...tttttt.......",
    "................"
  ], { d: "#2f5d2a", g: "#4c8f3c", h: "#63a84d", t: "#6b4a2f", ".": null });

  t.bush = mapToTexture(renderer, [
    "...dddd...",
    "..dggggd..",
    ".dghgggd..",
    "dggggghgd.",
    "dghgggggd.",
    ".dgggggd..",
    "..ddddd...",
    ".........."
  ], { d: "#2f5d2a", g: "#4c8f3c", h: "#63a84d", ".": null });

  t.flower = mapToTexture(renderer, [
    ".r..y..r..y..r",
    "r.r.y.r.r.y.r.",
    ".gggggggggggg.",
    "gggggggggggggg",
    "bbbbbbbbbbbbbb",
    "bbbbbbbbbbbbbb",
    "..............",
    ".............."
  ], { r: "#e0526a", y: "#ffd76a", g: "#4c8f3c", b: "#8d6e63", ".": null });

  t.lamp = mapToTexture(renderer, [
    "...yy...",
    "..yLLy..",
    "..yLLy..",
    "...yy...",
    "...pp...",
    "...pp...",
    "...pp...",
    "...pp...",
    "...pp...",
    "...pp...",
    "...pp...",
    "...pp...",
    "...pp...",
    "...pp...",
    "...pp...",
    "...pp...",
    "...pp...",
    "...pp...",
    "..pppp..",
    ".pppppp."
  ], { y: "#ffd76a", L: "#fff3c4", p: "#3b3f45", ".": null });

  t.bench = mapToTexture(renderer, [
    "wwwwwwwwwwwwwwww",
    "ssssssssssssssss",
    "ssssssssssssssss",
    "p..pp....pp..p..",
    "p..pp....pp..p..",
    "p..pp....pp..p..",
    "................",
    "................"
  ], { w: "#8d6e63", s: "#a1887f", p: "#4e342e", ".": null });

  t.door = mapToTexture(renderer, [
    ".dddddd.",
    "dgggggd.",
    "dglllgd.",
    "dglllgd.",
    "dgggggd.",
    "dgggggd.",
    "dgggggd.",
    "ddddddd."
  ], { d: "#4e342e", g: "#6d4c41", l: "#bfe3f2", ".": null });

  t.itemBox = mapToTexture(renderer, [
    "bbbbbbbb",
    "bllllllb",
    "blbbbb lb".slice(0, 8),
    "blbllblb",
    "blbbbb lb".slice(0, 8),
    "bllllllb",
    "bbbbbbbb",
    "........"
  ], { b: "#8d6e63", l: "#a1887f", ".": null });

  t.fountain = drawFountain(renderer);

  t.player = charFrames(renderer, "#37474f", "#2b2b33");
  t.npcA = charFrames(renderer, "#7a4a3a", "#3a2b22");
  t.npcB = charFrames(renderer, "#3a5a7a", "#22303a");
  t.npcC = charFrames(renderer, "#5a3a6a", "#2a2233");

  t.tile = t.asphalt;
  t.buildings = [];
  t.playerBody = t.player.down.stand;
  t.playerNub = t.player.down.stand;
  t.npcBody = t.npcA.down.stand;
  t.enemyBody = t.npcC.down.stand;
  t.pistol = mapToTexture(renderer, [
    "......gg",
    "gggggggg",
    "g......g",
    ".gg.....",
    ".gg.....",
    "..g....."
  ], { g: "#3b3f45", ".": null });
  t.reticle = mapToTexture(renderer, [
    ".rr.",
    "r..r",
    "r..r",
    ".rr."
  ], { r: "#ffd60a", ".": null });

  return t;
}

export { makePlaceholderTextures };