// Walkers follow a polyline back and forth. Pure functions so the routine logic
// is testable; the people component calls stepWalker once per frame.

const seg = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);

export const pathLength = (points) => {
  let total = 0;
  for (let i = 1; i < points.length; i++) total += seg(points[i - 1], points[i]);
  return total;
};

export const pointAt = (points, s) => {
  let left = Math.max(0, s);
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const len = seg(a, b);
    if (left <= len || i === points.length - 1) {
      const t = len ? Math.min(1, left / len) : 0;
      return { position: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], heading: Math.atan2(b[0] - a[0], b[1] - a[1]) };
    }
    left -= len;
  }
  return { position: [...points[0]], heading: 0 };
};

export const createWalker = ({ points, speed, endPause = 0 }) => ({
  points, speed, endPause, length: pathLength(points), s: 0, dir: 1, wait: 0,
});

const distToSegment = (p, a, b) => {
  const abx = b[0] - a[0];
  const abz = b[1] - a[1];
  const len2 = abx * abx + abz * abz;
  const t = len2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * abx + (p[1] - a[1]) * abz) / len2)) : 0;
  return Math.hypot(p[0] - (a[0] + abx * t), p[1] - (a[1] + abz * t));
};

export const shouldYield = (walker, player, { lookAhead = 1.2, radius = 0.7 } = {}) => {
  if (!player) return false;
  const here = pointAt(walker.points, walker.s).position;
  const ahead = pointAt(walker.points, Math.max(0, Math.min(walker.length, walker.s + walker.dir * lookAhead))).position;
  // Only what is ahead counts: ignore a player behind the walker's current spot.
  const toPlayer = [player[0] - here[0], player[1] - here[1]];
  const forward = [ahead[0] - here[0], ahead[1] - here[1]];
  if (toPlayer[0] * forward[0] + toPlayer[1] * forward[1] <= 0) return false;
  return distToSegment(player, here, ahead) < radius;
};

const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const headingFor = (walker) => {
  const probe = walker.dir > 0 ? Math.min(walker.s, walker.length - 0.001) : Math.max(walker.s - 0.001, 0);
  const { heading } = pointAt(walker.points, probe);
  return wrap(walker.dir > 0 ? heading : heading + Math.PI);
};

export const stepWalker = (walker, dt, player) => {
  const out = (w, moving, arrived) => ({ walker: w, moving, arrived, position: pointAt(w.points, w.s).position, heading: headingFor(w) });
  if (walker.wait > 0) return out({ ...walker, wait: Math.max(0, walker.wait - dt) }, false, false);
  if (shouldYield(walker, player)) return out(walker, false, false);
  const s = walker.s + walker.dir * walker.speed * dt;
  if (s >= walker.length) return out({ ...walker, s: walker.length, dir: -1, wait: walker.endPause }, true, true);
  if (s <= 0) return out({ ...walker, s: 0, dir: 1, wait: walker.endPause }, true, true);
  return out({ ...walker, s }, true, false);
};
