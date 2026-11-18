export function interpolatePose(scroll, stops) {
  if (scroll <= stops[0].scroll) return { ...stops[0] };
  const end = stops.findIndex((stop) => stop.scroll > scroll);
  if (end < 0)
    return {
      ...stops.at(-1),
      y: stops.at(-1).y - (scroll - stops.at(-1).scroll),
    };
  const a = stops[end - 1];
  const b = stops[end];
  const t = (scroll - a.scroll) / (b.scroll - a.scroll);
  const eased = t * t * (3 - 2 * t);
  const pose = {};
  for (const key of ["x", "height", "rx", "ry", "rz"])
    pose[key] = a[key] + (b[key] - a[key]) * eased;
  pose.y = a.y + (b.y - a.y) * t;
  return pose;
}
