// Районы вынесены отдельно: city.js (генератор) и game.js (location)
// используют один и тот же список без циклического импорта.

var DISTRICTS = [
  { id: "downtown",   name: "Downtown",            rect: { x: 0,    y: 0,    w: 3200, h: 3200 }, tint: 0x8a8474 },
  { id: "financial",  name: "Financial District",  rect: { x: 3200, y: 0,    w: 3200, h: 3200 }, tint: 0x83868c },
  { id: "shopping",   name: "Shopping District",   rect: { x: 6400, y: 0,    w: 3200, h: 3200 }, tint: 0x8a8272 },
  { id: "industrial", name: "Industrial District", rect: { x: 0,    y: 3200, w: 3200, h: 3200 }, tint: 0x7a766c },
  { id: "oldtown",    name: "Old Town",            rect: { x: 3200, y: 3200, w: 3200, h: 3200 }, tint: 0x877d6c },
  { id: "harbor",     name: "Harbor",              rect: { x: 6400, y: 3200, w: 3200, h: 3200 }, tint: 0x6e7a84 }
];

function districtAt(x, y) {
  for (var i = 0; i < DISTRICTS.length; i++) {
    var r = DISTRICTS[i].rect;
    if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) return DISTRICTS[i];
  }
  return null;
}

export { DISTRICTS, districtAt };