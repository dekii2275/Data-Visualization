/** Pure geometry and traffic profiles shared by the canvas renderer and tests. */
const FlowModel = (() => {
  const EARTH_RADIUS_M = 6371000;

  /** @param {number[]} a Latitude/longitude. @param {number[]} b Latitude/longitude. @returns {number} */
  function distance(a, b) {
    const radians = Math.PI / 180;
    const lat = (b[0] - a[0]) * radians;
    const lng = (b[1] - a[1]) * radians;
    const value = Math.sin(lat / 2) ** 2 + Math.cos(a[0] * radians) * Math.cos(b[0] * radians) * Math.sin(lng / 2) ** 2;
    return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(value)));
  }

  /** Build cumulative distances, ignoring invalid and zero-length geometry. @param {number[][]} coordinates @returns {Object|null} */
  function buildPath(coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length < 2 || coordinates.some(p =>
      !Array.isArray(p) || p.length < 2 || !p.every(Number.isFinite) || Math.abs(p[0]) > 90 || Math.abs(p[1]) > 180)) return null;
    const cumulative = [0];
    for (let i = 1; i < coordinates.length; i++) cumulative.push(cumulative[i - 1] + distance(coordinates[i - 1], coordinates[i]));
    const length = cumulative.at(-1);
    return length > 0.5 ? { coordinates, cumulative, length } : null;
  }

  /** Interpolate position and tangent along a path, optionally using projected points. @param {Object} path @param {number} progress Wrapped fraction. @param {number[][]} coordinates Geographic or screen points. @returns {number[]} Position followed by tangent components. */
  function pointAt(path, progress, coordinates = path.coordinates) {
    const target = (((progress % 1) + 1) % 1) * path.length;
    let index = 1;
    while (index < path.cumulative.length - 1 && path.cumulative[index] < target) index++;
    const span = path.cumulative[index] - path.cumulative[index - 1];
    const t = span ? (target - path.cumulative[index - 1]) / span : 0;
    const a = coordinates[index - 1];
    const b = coordinates[index];
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, b[0] - a[0], b[1] - a[1]];
  }

  /** Select existing segments intersecting an area and optional road name. @param {Object[]} segments @param {Object} area @param {string} road @returns {Object[]} */
  function selectSegments(segments, area, road = '') {
    return segments.filter(segment => (!road || segment.name === road) && buildPath(segment.coords) && segment.coords.some(p =>
      p[0] >= area.bounds[0][0] && p[0] <= area.bounds[1][0] && p[1] >= area.bounds[0][1] && p[1] <= area.bounds[1][1]));
  }

  /** Read hourly LOS; use the observed dominant LOS if a slot is missing. @param {Object} segment @param {number} hour @returns {string} */
  function losAt(segment, hour) {
    const los = segment.hourly_los?.[Math.floor(((hour % 24) + 24) % 24)] ?? segment.dominant_los;
    return Object.hasOwn(FLOW_CONFIG.profiles, los) ? los : 'C';
  }

  /** Summarize only selected geometry; speed is illustrative, length weighted. @param {Object[]} segments @param {number} hour @returns {Object} */
  function summarize(segments, hour) {
    let severe = 0;
    let weightedSpeed = 0;
    let totalLength = 0;
    for (const segment of segments) {
      const los = losAt(segment, hour);
      const length = buildPath(segment.coords)?.length ?? 0;
      if (los === 'E' || los === 'F') severe++;
      weightedSpeed += length * FLOW_CONFIG.profiles[los].speed;
      totalLength += length;
    }
    return { count: segments.length, severe, severePct: segments.length ? severe * 100 / segments.length : 0, speed: totalLength ? weightedSpeed / totalLength : 0 };
  }

  return { distance, buildPath, pointAt, selectSegments, losAt, summarize };
})();
