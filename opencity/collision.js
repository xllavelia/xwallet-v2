// AABB коллизии + геометрия видимости. Ось-раздельное разрешение:
// персонаж скользит вдоль стен, а не залипает на углах.

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// body: {x, y, w, h} (x,y — левый верхний угол), colliders: [{x,y,w,h}]
function moveAndCollide(body, dx, dy, colliders) {
  var i, r;
  body.x += dx;
  for (i = 0; i < colliders.length; i++) {
    r = colliders[i];
    if (!rectsOverlap(body, r)) continue;
    if (dx > 0) body.x = r.x - body.w;
    else if (dx < 0) body.x = r.x + r.w;
  }
  body.y += dy;
  for (i = 0; i < colliders.length; i++) {
    r = colliders[i];
    if (!rectsOverlap(body, r)) continue;
    if (dy > 0) body.y = r.y - body.h;
    else if (dy < 0) body.y = r.y + r.h;
  }
}

// Пересекает ли отрезок (x1,y1)-(x2,y2) прямоугольник (slab method).
// Точный тест, не сэмплирование — дёшев для combat line of sight.
function segmentIntersectsRect(x1, y1, x2, y2, r) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  var tmin = 0;
  var tmax = 1;

  if (dx === 0) {
    if (x1 < r.x || x1 > r.x + r.w) return false;
  } else {
    var tx1 = (r.x - x1) / dx;
    var tx2 = (r.x + r.w - x1) / dx;
    if (tx1 > tx2) { var t = tx1; tx1 = tx2; tx2 = t; }
    if (tx1 > tmin) tmin = tx1;
    if (tx2 < tmax) tmax = tx2;
    if (tmin > tmax) return false;
  }

  if (dy === 0) {
    if (y1 < r.y || y1 > r.y + r.h) return false;
  } else {
    var ty1 = (r.y - y1) / dy;
    var ty2 = (r.y + r.h - y1) / dy;
    if (ty1 > ty2) { var t2 = ty1; ty1 = ty2; ty2 = t2; }
    if (ty1 > tmin) tmin = ty1;
    if (ty2 < tmax) tmax = ty2;
    if (tmin > tmax) return false;
  }

  return true;
}

// Line of sight: true, если ни один коллайдер не перекрывает линию.
function hasLineOfSight(x1, y1, x2, y2, colliders) {
  for (var i = 0; i < colliders.length; i++) {
    if (segmentIntersectsRect(x1, y1, x2, y2, colliders[i])) return false;
  }
  return true;
}

export { moveAndCollide, rectsOverlap, segmentIntersectsRect, hasLineOfSight };