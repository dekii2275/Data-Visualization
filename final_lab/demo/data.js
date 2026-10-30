/**
 * @typedef {Object} TrafficDataset
 * @property {Object} metadata
 * @property {Object} system_kpis
 * @property {Object} hourly_system_stats
 * @property {Array<Object>} segments
 * @property {Array<Object>} hotspots
 * @property {Array<Object>} routing_scenarios
 */

/** Traffic transport and standalone fallback, independent of DOM rendering. */
const TrafficDataClient = {
  /**
   * Fetch and validate the dataset shape, aborting a stalled connection.
   * @param {string} url Data endpoint or static JSON path.
   * @returns {Promise<TrafficDataset>} Parsed traffic records.
   */
  async fetchDataset(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), DATA_CONFIG.timeoutMs);
    try {
      const response = await fetch(url, { cache: 'no-cache', signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (!data.metadata || !data.system_kpis || !data.hourly_system_stats ||
          !Array.isArray(data.segments) || !Array.isArray(data.hotspots) ||
          !Array.isArray(data.routing_scenarios)) {
        throw new Error('Invalid traffic dataset');
      }
      return data;
    } finally {
      clearTimeout(timeout);
    }
  },

  /** @returns {Promise<{data: TrafficDataset, live: boolean}>} Dataset and transport mode. */
  async load() {
    try {
      return { data: await this.fetchDataset(DATA_CONFIG.apiUrl), live: true };
    } catch (error) {
      console.warn('[IOC] API unavailable; loading standalone dataset.', error);
      return { data: await this.fetchDataset(DATA_CONFIG.fallbackUrl), live: false };
    }
  }
};
