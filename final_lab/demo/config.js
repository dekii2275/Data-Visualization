/** @typedef {{apiUrl: string, fallbackUrl: string, timeoutMs: number}} DataConfig */
/** @type {Readonly<DataConfig>} Shared traffic data connection settings. */
const DATA_CONFIG = Object.freeze({
  apiUrl: '/api/traffic/data',
  fallbackUrl: 'traffic_data.json',
  timeoutMs: 5000
});
