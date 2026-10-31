/**
 * Canvas traffic stream. Vehicles loop within measured segment geometry; no
 * individual trajectories, street connectivity or travel direction are inferred.
 */
class VehicleFlowLayer {
  /** @param {Object} map Leaflet map. */
  constructor(map) {
    this.map = map;
    this.records = new Map();
    this.hour = FLOW_CONFIG.initialHour;
    this.running = false;
    this.enabled = true;
    this.frame = null;
    this.lastTimestamp = null;
    this.lastDraw = 0;
    this.projected = false;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'vehicle-flow-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.context = this.canvas.getContext('2d');
    map.getContainer().append(this.canvas);
    this.onMapChange = () => { this.projected = false; this.draw(); };
    this.onVisibility = () => this.schedule();
    map.on('move zoom resize viewreset', this.onMapChange);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.tick = this.tick.bind(this);
  }

  /** Reconcile selected segments, retaining vehicle phase across hour changes. @param {Object[]} segments @param {number} hour */
  setSegments(segments, hour) {
    const next = new Map();
    this.hour = hour;
    for (const segment of segments) {
      const path = FlowModel.buildPath(segment.coords);
      if (!path) continue;
      const previous = this.records.get(segment.id);
      next.set(segment.id, { segment, path, offset: previous?.offset ?? (Math.abs(segment.id) % 97) / 97, screen: [] });
    }
    this.records = next;
    this.projected = false;
    this.draw();
    this.schedule();
  }

  /** @param {boolean} running Pause both continuous movement and its frame loop. */
  setRunning(running) {
    this.running = running;
    this.schedule();
  }

  /** @param {boolean} enabled Suspend the stream when another feature is selected. */
  setEnabled(enabled) {
    this.enabled = enabled;
    this.canvas.hidden = !enabled;
    this.schedule();
    if (enabled) { this.projected = false; this.draw(); }
  }

  /** Stop work in background tabs; never schedule more than one frame loop. */
  schedule() {
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
    this.lastTimestamp = null;
    if (this.running && this.enabled && !document.hidden) this.frame = requestAnimationFrame(this.tick);
  }

  /** Advance positions by elapsed wall time, independent of monitor frame rate. @param {number} timestamp */
  tick(timestamp) {
    this.frame = null;
    if (!this.running || !this.enabled || document.hidden) return;
    const delta = this.lastTimestamp === null ? 0 : Math.min((timestamp - this.lastTimestamp) / 1000, FLOW_CONFIG.maxFrameDeltaSeconds);
    this.lastTimestamp = timestamp;
    for (const record of this.records.values()) {
      const speed = FLOW_CONFIG.profiles[FlowModel.losAt(record.segment, this.hour)].speed;
      record.offset = (record.offset + (speed / 3.6) * FLOW_CONFIG.visualSpeedScale * delta / record.path.length) % 1;
    }
    if (timestamp - this.lastDraw >= FLOW_CONFIG.frameIntervalMs) {
      this.draw();
      this.lastDraw = timestamp;
    }
    this.frame = requestAnimationFrame(this.tick);
  }

  /** Cache map projections when the viewport changes, avoiding per-frame geo work. */
  project() {
    const size = this.map.getSize();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(size.x * ratio);
    this.canvas.height = Math.round(size.y * ratio);
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
    for (const record of this.records.values()) {
      record.screen = record.path.coordinates.map(point => {
        const projected = this.map.latLngToContainerPoint(point);
        return [projected.x, projected.y];
      });
    }
    this.projected = true;
  }

  /** Draw a small directional vehicle on an existing segment, with endpoint fades. */
  draw() {
    if (!this.enabled || !this.context) return;
    if (!this.projected) this.project();
    const ctx = this.context;
    const size = this.map.getSize();
    ctx.clearRect(0, 0, size.x, size.y);
    const zoomScale = Math.min(1.5, Math.max(0.85, (this.map.getZoom() - 12) / 3));
    for (const record of this.records.values()) {
      const profile = FLOW_CONFIG.profiles[FlowModel.losAt(record.segment, this.hour)];
      const count = Math.min(FLOW_CONFIG.maxVehiclesPerSegment, Math.max(2, Math.ceil(record.path.length / profile.spacing)));
      for (let i = 0; i < count; i++) {
        const reverse = i % 2 === 1;
        const phase = (record.offset + i / count) % 1;
        const progress = reverse ? 1 - phase : phase;
        const [centerX, centerY, dx, dy] = FlowModel.pointAt(record.path, progress, record.screen);
        if (dx === 0 && dy === 0) continue;
        const angle = Math.atan2(dy, dx) + (reverse ? Math.PI : 0);
        const laneOffset = 2.4 * zoomScale;
        const x = centerX - Math.sin(angle) * laneOffset;
        const y = centerY + Math.cos(angle) * laneOffset;
        if (x < -10 || y < -10 || x > size.x + 10 || y > size.y + 10) continue;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.globalAlpha = Math.min(1, phase * 15, (1 - phase) * 15);
        ctx.fillStyle = profile.color;
        ctx.strokeStyle = '#101827';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.roundRect(-3.6 * zoomScale, -1.8 * zoomScale, 7.2 * zoomScale, 3.6 * zoomScale, 1.2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.fillRect(1 * zoomScale, -1.1 * zoomScale, 1.3 * zoomScale, 2.2 * zoomScale);
        ctx.restore();
      }
    }
  }

  /** Release DOM, map listeners and animation callbacks when the view is destroyed. */
  destroy() {
    this.running = false;
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.map.off('move zoom resize viewreset', this.onMapChange);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.canvas.remove();
  }
}
