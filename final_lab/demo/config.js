/** @typedef {{apiUrl: string, fallbackUrl: string, timeoutMs: number}} DataConfig */
/** @type {Readonly<DataConfig>} Shared traffic data connection settings. */
const DATA_CONFIG = Object.freeze({
  apiUrl: '/api/traffic/data',
  fallbackUrl: 'traffic_data.json',
  timeoutMs: 5000
});

/** Central settings for the illustrative 24-hour traffic flow. */
const FLOW_CONFIG = Object.freeze({
  initialHour: 7,
  halfHourDurationMs: 2400,
  frameIntervalMs: 1000 / 30,
  maxFrameDeltaSeconds: 0.1,
  visualSpeedScale: 1.5,
  maxVehiclesPerSegment: 18,
  minimumZoom: 14,
  maximumZoom: 19,
  defaultArea: 'district10',
  areas: [
    { id: 'district10', name: 'Lý Thường Kiệt – Q.10', bounds: [[10.755, 106.650], [10.780, 106.674]] },
    { id: 'conghoa', name: 'Trục Cộng Hòa', bounds: [[10.791, 106.624], [10.813, 106.656]] },
    { id: 'govap', name: 'Khu vực Gò Vấp', bounds: [[10.813, 106.645], [10.868, 106.690]] },
    { id: 'district12', name: 'Khu vực Quận 12', bounds: [[10.841, 106.600], [10.886, 106.651]] }
  ],
  // LOS drives illustrative speed and vehicle spacing, not measured traffic volume.
  profiles: {
    A: { speed: 42, spacing: 55, color: '#10b981' },
    B: { speed: 32, spacing: 43, color: '#10b981' },
    C: { speed: 22, spacing: 32, color: '#f59e0b' },
    D: { speed: 15, spacing: 24, color: '#f59e0b' },
    E: { speed: 8, spacing: 17, color: '#ef4444' },
    F: { speed: 3, spacing: 12, color: '#a855f7' }
  }
});

/** Shared LOS presentation and map provider settings. */
const LOS_CONFIG = {
  'A': { color: '#10b981', label: 'LOS A - Thông suốt', speed: 42 },
  'B': { color: '#06b6d4', label: 'LOS B - Ổn định', speed: 32 },
  'C': { color: '#f59e0b', label: 'LOS C - Chậm vừa', speed: 22 },
  'D': { color: '#f97316', label: 'LOS D - Tiệm cận bão hòa', speed: 15 },
  'E': { color: '#ef4444', label: 'LOS E - Kẹt xe nghiêm trọng', speed: 8 },
  'F': { color: '#a855f7', label: 'LOS F - Tê liệt hoàn toàn (Gridlock)', speed: 3 }
};

const BASEMAPS = {
  osm: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri &mdash; World Imagery'
    }
  },
  dark: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
      className: 'osm-dark-tiles',
      attribution: '&copy; OpenStreetMap'
    }
  }
};
