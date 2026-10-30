/**
 * HCMC Smart Traffic IOC - Interactive Digital Twin Engine
 * Authors: Senior Smart Mobility Consultant Team
 */

// Global Application State
const state = {
  data: null,
  currentHour: 17.5, // Default to evening peak 17:30
  isPlaying: false,
  playSpeed: 1, // 1x, 2x, 4x
  playInterval: null,
  map: null,
  segmentLayers: [],
  hotspotLayers: [],
  selectedSegment: null,
  filterType: 'all',
  filterOnlySevere: false,
  simPolicies: {
    adaptive: true,
    tidal: true,
    noLeft: false
  },
  activeTab: 'policy', // 'policy' | 'routing'
  activeScenarioIndex: 0,
  vehicleMode: 'emergency', // 'emergency' | 'car' | 'bus'
  currentBasemap: 'osm',
  basemapLayer: null,
  routingLayers: [],
  vehicleAnimation: {
    interval: null,
    staticMarker: null,
    dynamicMarker: null,
    isRunning: false
  }
};

const LOS_CONFIG = {
  'A': { color: '#10b981', label: 'LOS A - Thông suốt', speed: 42 },
  'B': { color: '#06b6d4', label: 'LOS B - Ổn định', speed: 32 },
  'C': { color: '#f59e0b', label: 'LOS C - Chậm vừa', speed: 22 },
  'D': { color: '#f97316', label: 'LOS D - Tiệm cận bão hòa', speed: 15 },
  'E': { color: '#ef4444', label: 'LOS E - Kẹt xe nghiêm trọng', speed: 8 },
  'F': { color: '#a855f7', label: 'LOS F - Tê liệt hoàn toàn (Gridlock)', speed: 3 }
};

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[IOC] Initializing HCMC Traffic Intelligence System...');
  initMap();
  setupEventListeners();
  if (await loadTrafficData()) updateDashboard(state.currentHour);
});

// ==========================================================================
// MAP INITIALIZATION (Real World Map Tiles)
// ==========================================================================
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

function setBasemap(type) {
  if (state.basemapLayer) {
    state.map.removeLayer(state.basemapLayer);
  }
  const conf = BASEMAPS[type] || BASEMAPS['osm'];
  state.currentBasemap = type;
  state.basemapLayer = L.tileLayer(conf.url, conf.options).addTo(state.map);
  state.basemapLayer.bringToBack();
}

function initMap() {
  // Center on District 10 / Tan Binh / Central HCMC
  state.map = L.map('traffic-map', {
    center: [10.7765, 106.6620],
    zoom: 13,
    zoomControl: false,
    attributionControl: false
  });

  // Default to Real OpenStreetMap (Đường phố thực tế TP.HCM)
  setBasemap('osm');

  // Zoom control in bottom left
  L.control.zoom({ position: 'bottomleft' }).addTo(state.map);
}

// ==========================================================================
// LOAD DATA
// ==========================================================================
/** @returns {Promise<boolean>} Whether a usable dataset was loaded and rendered. */
async function loadTrafficData() {
  const statusPill = document.getElementById('backend-status-pill');
  try {
    const result = await TrafficDataClient.load();
    state.data = result.data;
    if (statusPill) {
      statusPill.textContent = result.live ? 'API DOCKER LIVE' : 'LOCAL STANDALONE';
      statusPill.classList.toggle('status-live', result.live);
      statusPill.classList.toggle('status-local', !result.live);
    }
    renderHotspots();
    renderSegments();
    populateHotspotsList();
    initRoutingSimulator();
    return true;
  } catch (error) {
    console.error('[IOC] Failed to load traffic data:', error);
    if (statusPill) statusPill.textContent = 'DATA UNAVAILABLE';
    alert('Không thể nạp dữ liệu giao thông. Hãy chạy HTTP server và kiểm tra kết nối.');
    return false;
  }
}

// ==========================================================================
// RENDER MAP LAYERS
// ==========================================================================
function renderSegments() {
  if (!state.data || !state.data.segments) return;

  // Clear existing
  state.segmentLayers.forEach(l => state.map.removeLayer(l));
  state.segmentLayers = [];

  const hourInt = Math.floor(state.currentHour);

  state.data.segments.forEach(seg => {
    // Determine LOS for current hour
    let currentLos = seg.hourly_los ? seg.hourly_los[hourInt] : seg.dominant_los;

    // If simulation active on Ly Thuong Kiet / To Hien Thanh, improve LOS
    if (state.simPolicies.adaptive && (seg.name.includes('Lý Thường Kiệt') || seg.name.includes('Tô Hiến Thành'))) {
      if (currentLos === 'F') currentLos = 'D';
      else if (currentLos === 'E') currentLos = 'C';
      else if (currentLos === 'D') currentLos = 'B';
    }

    const losConf = LOS_CONFIG[currentLos] || LOS_CONFIG['A'];
    const isSevere = currentLos === 'E' || currentLos === 'F';

    // Filters
    if (state.filterType !== 'all' && seg.type !== state.filterType) return;
    if (state.filterOnlySevere && !isSevere) return;

    const polyline = L.polyline(seg.coords, {
      color: losConf.color,
      weight: isSevere ? 4.5 : 3.2,
      opacity: isSevere ? 0.95 : 0.75,
      className: isSevere ? 'congested-line' : 'normal-line'
    });

    // Tooltip hover
    polyline.bindTooltip(`<strong>${seg.name}</strong><br/>${losConf.label}`, {
      sticky: true,
      direction: 'top'
    });

    // Click to open detailed modal
    polyline.on('click', () => {
      openSegmentModal(seg, currentLos);
    });

    polyline.addTo(state.map);
    state.segmentLayers.push(polyline);
  });
}

function renderHotspots() {
  if (!state.data || !state.data.hotspots) return;

  state.hotspotLayers.forEach(l => state.map.removeLayer(l));
  state.hotspotLayers = [];

  state.data.hotspots.forEach(hp => {
    // Custom Pulsing DivIcon
    const pulseIcon = L.divIcon({
      className: 'custom-pulsing-icon',
      html: `<div class="pulsing-marker" title="${hp.name}"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const marker = L.marker([hp.lat, hp.lng], { icon: pulseIcon });
    marker.bindPopup(`
      <div class="map-popup">
        <h5 class="hotspot-popup-title">🔥 ${hp.name}</h5>
        <p class="hotspot-popup-description">${hp.desc}</p>
      </div>
    `);

    marker.addTo(state.map);
    state.hotspotLayers.push(marker);
  });
}

function populateHotspotsList() {
  const container = document.getElementById('hotspots-list');
  if (!container || !state.data || !state.data.hotspots) return;

  container.innerHTML = '';
  state.data.hotspots.forEach(hp => {
    const card = document.createElement('div');
    card.className = 'hotspot-card';
    card.innerHTML = `
      <div class="hotspot-header">
        <span class="hotspot-name">${hp.name.split('(')[0]}</span>
        <span class="hotspot-badge">ĐIỂM NÓNG</span>
      </div>
      <div class="hotspot-desc">${hp.desc}</div>
    `;

    card.addEventListener('click', () => {
      state.map.flyTo([hp.lat, hp.lng], 15, { duration: 1.2 });
    });

    container.appendChild(card);
  });
}

// ==========================================================================
// SEGMENT MODAL
// ==========================================================================
function openSegmentModal(seg, los) {
  state.selectedSegment = seg;
  const modal = document.getElementById('segment-modal');
  const losConf = LOS_CONFIG[los] || LOS_CONFIG['A'];

  document.getElementById('modal-street-type').textContent = seg.type;
  document.getElementById('modal-street-name').textContent = seg.name;
  document.getElementById('modal-length').textContent = `${seg.length} m`;

  const losBadge = document.getElementById('modal-current-los');
  losBadge.textContent = losConf.label;
  losBadge.style.backgroundColor = losConf.color;

  document.getElementById('modal-severe-rate').textContent = `${seg.severe_rate}% quan sát`;
  document.getElementById('modal-speed').textContent = `${losConf.speed} km/h`;

  modal.style.display = 'block';
}

function closeSegmentModal() {
  const modal = document.getElementById('segment-modal');
  modal.style.display = 'none';
  state.selectedSegment = null;
}

// ==========================================================================
// DASHBOARD UPDATE LOGIC
// ==========================================================================
function updateDashboard(hourFloat) {
  const hInt = Math.floor(hourFloat);
  const mInt = Math.round((hourFloat - hInt) * 60);
  const timeStr = `${String(hInt).padStart(2, '0')}:${String(mInt).padStart(2, '0')}`;

  // Update clock & timeline slider
  document.getElementById('clock-display').textContent = timeStr;
  document.getElementById('timeline-slider').value = hourFloat;

  // Peak status evaluation
  const statusPill = document.getElementById('header-status-pill');
  const periodLabel = document.getElementById('current-period-label');
  const stressLevel = document.getElementById('current-stress-level');

  let peakStatus = 'Bình Thường (Dòng xe ổn định)';
  let isPeak = false;

  if (hourFloat >= 6.5 && hourFloat <= 9.0) {
    peakStatus = `CAO ĐIỂM SÁNG (${timeStr})`;
    isPeak = true;
  } else if (hourFloat >= 16.5 && hourFloat <= 19.5) {
    peakStatus = `CAO ĐIỂM CHIỀU - ĐỈNH KẸT XE (${timeStr})`;
    isPeak = true;
  } else if (hourFloat >= 0.0 && hourFloat < 6.0) {
    peakStatus = `ĐÊM & RẠNG SÁNG (${timeStr})`;
  } else {
    peakStatus = `BAN NGÀY / GIỜ THẤP ĐIỂM (${timeStr})`;
  }

  periodLabel.textContent = peakStatus;

  // Retrieve stats from JSON
  if (state.data && state.data.hourly_system_stats) {
    const stats = state.data.hourly_system_stats[hInt] || {};
    let severePct = stats.severe_pct || 20;
    let avgScore = stats.avg_score || 3.0;
    let estSpeed = stats.est_speed || 22;
    const losDist = stats.los_dist || { 'A': 40, 'B': 20, 'C': 15, 'D': 10, 'E': 10, 'F': 5 };

    // Update KPI Numbers
    document.getElementById('kpi-severe-pct').textContent = `${severePct}%`;
    document.getElementById('kpi-severe-bar').style.width = `${Math.min(100, severePct * 2)}%`;
    document.getElementById('kpi-severe-sub').textContent = `${Math.round((severePct / 100) * 450)} / 450 đoạn rơi vào tê liệt`;

    document.getElementById('kpi-speed-val').textContent = estSpeed;
    document.getElementById('kpi-speed-bar').style.width = `${Math.min(100, (estSpeed / 50) * 100)}%`;

    document.getElementById('kpi-score-val').textContent = avgScore;
    stressLevel.textContent = `Áp lực kẹt xe: ${severePct}% tuyến đường quá tải`;

    const scoreTag = document.getElementById('kpi-score-tag');
    if (avgScore > 3.5) {
      scoreTag.textContent = 'Cực Kỳ Nguy Cấp';
      scoreTag.style.background = 'rgba(239, 68, 68, 0.2)';
      scoreTag.style.color = '#ff6b6b';
    } else if (avgScore > 2.5) {
      scoreTag.textContent = 'Ngưỡng Căng Thẳng';
      scoreTag.style.background = 'rgba(245, 158, 11, 0.2)';
      scoreTag.style.color = '#fbbf24';
    } else {
      scoreTag.textContent = 'Lưu Thông Thông Suốt';
      scoreTag.style.background = 'rgba(16, 185, 129, 0.2)';
      scoreTag.style.color = '#10b981';
    }

    // Update Stacked Bar
    for (const [los, pct] of Object.entries(losDist)) {
      const lower = los.toLowerCase();
      const barEl = document.getElementById(`bar-los-${lower}`);
      const txtEl = document.getElementById(`pct-los-${lower}`);
      if (barEl) barEl.style.width = `${pct}%`;
      if (txtEl) txtEl.textContent = `${pct}%`;
    }
  }

  // Redraw map lines for new hour
  renderSegments();
  updateSimulationImpact();
  if (state.activeTab === 'routing') {
    updateRouteMetricsForHour(state.currentHour);
  }
}

// ==========================================================================
// SIMULATION IMPACT CALCULATOR
// ==========================================================================
function updateSimulationImpact() {
  const baseSevere = 38.2;
  const baseSpeed = 14.2;

  let severeReduction = 0;
  let speedGain = 0;

  if (state.simPolicies.adaptive) {
    severeReduction += 13.5;
    speedGain += 5.2;
  }
  if (state.simPolicies.tidal) {
    severeReduction += 8.2;
    speedGain += 3.8;
  }
  if (state.simPolicies.noLeft) {
    severeReduction += 4.5;
    speedGain += 1.8;
  }

  const finalSevere = Math.max(10.5, (baseSevere - severeReduction)).toFixed(1);
  const finalSpeed = (baseSpeed + speedGain).toFixed(1);
  const pctSaved = Math.round(((baseSevere - finalSevere) / baseSevere) * 100);

  document.getElementById('sim-before-severe').textContent = `${baseSevere}%`;
  document.getElementById('sim-after-severe').textContent = `${finalSevere}%`;
  document.getElementById('sim-delta-badge').textContent = `GIẢM ${pctSaved}% TẮC NGHẼN GIỜ CAO ĐIỂM`;
  document.getElementById('sim-speed-change').textContent = `${baseSpeed} km/h ➔ ${finalSpeed} km/h (+${Math.round(((finalSpeed - baseSpeed)/baseSpeed)*100)}%)`;
  document.getElementById('sim-time-saved').textContent = `~${(10 + severeReduction * 0.4).toFixed(1)} phút / xe`;
}

// ==========================================================================
// EVENT LISTENERS & CONTROLS
// ==========================================================================
function setupEventListeners() {
  // Timeline slider input
  const slider = document.getElementById('timeline-slider');
  slider.addEventListener('input', (e) => {
    state.currentHour = parseFloat(e.target.value);
    updateDashboard(state.currentHour);
  });

  // Play / Pause Button
  const btnPlay = document.getElementById('btn-play-pause');
  btnPlay.addEventListener('click', togglePlay);

  // Speed Buttons
  document.querySelectorAll('.btn-speed').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-speed').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.playSpeed = parseInt(btn.dataset.speed, 10);
      if (state.isPlaying) {
        clearInterval(state.playInterval);
        startPlayback();
      }
    });
  });

  // Basemap switcher (Real OSM vs Satellite vs Dark)
  const basemapSelect = document.getElementById('basemap-select');
  if (basemapSelect) {
    basemapSelect.addEventListener('change', (e) => {
      setBasemap(e.target.value);
    });
  }

  // Street type filter
  document.getElementById('street-type-filter').addEventListener('change', (e) => {
    state.filterType = e.target.value;
    renderSegments();
  });

  // Only severe checkbox
  document.getElementById('chk-only-severe').addEventListener('change', (e) => {
    state.filterOnlySevere = e.target.checked;
    renderSegments();
  });

  // Hotspots toggle
  document.getElementById('chk-show-hotspots').addEventListener('change', (e) => {
    if (e.target.checked) {
      renderHotspots();
    } else {
      state.hotspotLayers.forEach(l => state.map.removeLayer(l));
      state.hotspotLayers = [];
    }
  });

  // Simulation Toggles
  document.getElementById('toggle-sim-adaptive').addEventListener('change', (e) => {
    state.simPolicies.adaptive = e.target.checked;
    updateSimulationImpact();
    renderSegments();
  });

  document.getElementById('toggle-sim-tidal').addEventListener('change', (e) => {
    state.simPolicies.tidal = e.target.checked;
    updateSimulationImpact();
    renderSegments();
  });

  document.getElementById('toggle-sim-noleft').addEventListener('change', (e) => {
    state.simPolicies.noLeft = e.target.checked;
    updateSimulationImpact();
    renderSegments();
  });

  // Modal Close
  document.getElementById('btn-close-modal').addEventListener('click', closeSegmentModal);

  // Export Proposal Button
  document.getElementById('btn-export-proposal').addEventListener('click', () => {
    alert('Đã tạo thành công Tờ Trình Đề Án Thí Điểm! Xin mời tham khảo tài liệu Báo cáo Tư Vấn đầy đủ tại eda_report/bao_cao_tu_van_giaothong_tphcm.md');
  });

  // Fullscreen button
  document.getElementById('btn-toggle-fullscreen').addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => alert(err.message));
    } else {
      document.exitFullscreen();
    }
  });

  // Scroll to simulation panel on click
  document.getElementById('btn-open-simulation').addEventListener('click', () => {
    document.getElementById('panel-simulation').scrollIntoView({ behavior: 'smooth' });
  });
}

function togglePlay() {
  state.isPlaying = !state.isPlaying;
  const icon = document.getElementById('play-icon');

  if (state.isPlaying) {
    icon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
    startPlayback();
  } else {
    icon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
    clearInterval(state.playInterval);
  }
}

function startPlayback() {
  const intervalMs = 1200 / state.playSpeed;
  state.playInterval = setInterval(() => {
    state.currentHour += 0.5;
    if (state.currentHour > 23.5) {
      state.currentHour = 0;
    }
    updateDashboard(state.currentHour);
  }, intervalMs);
}

// ==========================================================================
// SMART ROUTING SIMULATOR MODULE
// ==========================================================================

function initRoutingSimulator() {
  // Tab Switching buttons
  const btnPolicy = document.getElementById('tab-btn-policy');
  const btnRouting = document.getElementById('tab-btn-routing');
  if (btnPolicy) btnPolicy.addEventListener('click', () => switchTab('policy'));
  if (btnRouting) btnRouting.addEventListener('click', () => switchTab('routing'));

  // Header quick jump button
  const btnOpenRouting = document.getElementById('btn-open-routing');
  if (btnOpenRouting) {
    btnOpenRouting.addEventListener('click', () => {
      switchTab('routing');
      document.getElementById('panel-simulation').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Header open simulation button should switch to policy tab
  const btnOpenSim = document.getElementById('btn-open-simulation');
  if (btnOpenSim) {
    btnOpenSim.addEventListener('click', () => {
      switchTab('policy');
      document.getElementById('panel-simulation').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Vehicle mode selector
  document.querySelectorAll('.btn-vehicle').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-vehicle').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.vehicleMode = btn.dataset.mode;
      renderActiveScenarioRoute();
    });
  });

  // Action buttons
  const btnStartSim = document.getElementById('btn-start-vehicle-sim');
  if (btnStartSim) {
    btnStartSim.addEventListener('click', toggleVehicleSimulation);
  }

  const btnResetSim = document.getElementById('btn-reset-route-view');
  if (btnResetSim) {
    btnResetSim.addEventListener('click', resetRoutingView);
  }

  // Populate scenario cards
  renderScenarioCards();
}

function switchTab(tabName) {
  state.activeTab = tabName;
  const btnPolicy = document.getElementById('tab-btn-policy');
  const btnRouting = document.getElementById('tab-btn-routing');
  const panePolicy = document.getElementById('tab-content-policy');
  const paneRouting = document.getElementById('tab-content-routing');
  const title = document.getElementById('panel-right-title');
  const badge = document.getElementById('panel-right-badge');

  if (tabName === 'routing') {
    if (btnPolicy) btnPolicy.classList.remove('active');
    if (btnRouting) btnRouting.classList.add('active');
    if (panePolicy) panePolicy.style.display = 'none';
    if (paneRouting) paneRouting.style.display = 'block';
    if (title) title.textContent = 'ĐỊNH TUYẾN THÍCH ỨNG AI';
    if (badge) badge.textContent = 'AI DYNAMIC ROUTING';

    renderActiveScenarioRoute();
  } else {
    if (btnPolicy) btnPolicy.classList.add('active');
    if (btnRouting) btnRouting.classList.remove('active');
    if (panePolicy) panePolicy.style.display = 'block';
    if (paneRouting) paneRouting.style.display = 'none';
    if (title) title.textContent = 'MÔ PHỎNG GIẢI PHÁP CAN THIỆP';
    if (badge) badge.textContent = 'TƯ VẤN SỞ GTVT';

    clearRoutingLayers();
    stopVehicleSimulation();
    state.map.setView([10.7765, 106.6620], 13);
  }
}

function renderScenarioCards() {
  const container = document.getElementById('scenario-selector-grid');
  if (!container || !state.data || !state.data.routing_scenarios) return;

  container.innerHTML = '';
  state.data.routing_scenarios.forEach((sc, idx) => {
    const card = document.createElement('div');
    card.className = `scenario-card ${idx === state.activeScenarioIndex ? 'active' : ''}`;
    card.dataset.index = idx;
    card.innerHTML = `
      <div class="scenario-card-icon">${sc.icon}</div>
      <div class="scenario-card-info">
        <div class="scenario-card-title">${sc.name}</div>
        <div class="scenario-card-route">${sc.start.name.split('(')[0]} ➔ ${sc.end.name.split('(')[0]}</div>
      </div>
    `;

    card.addEventListener('click', () => {
      document.querySelectorAll('.scenario-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      state.activeScenarioIndex = idx;
      renderActiveScenarioRoute();
    });

    container.appendChild(card);
  });
}

function clearRoutingLayers() {
  state.routingLayers.forEach(l => state.map.removeLayer(l));
  state.routingLayers = [];
}

function renderActiveScenarioRoute() {
  if (!state.data || !state.data.routing_scenarios) return;
  const sc = state.data.routing_scenarios[state.activeScenarioIndex];
  if (!sc) return;

  stopVehicleSimulation();
  clearRoutingLayers();

  // 1. Draw Static Route (Crimson dashed line)
  const staticLine = L.polyline(sc.static_route.path, {
    color: '#ef4444',
    weight: 5,
    opacity: 0.85,
    dashArray: '8, 8'
  });
  staticLine.bindTooltip(`<strong>Lộ Trình Cũ (Tĩnh)</strong><br/>Khoảng cách: ${sc.static_route.distance_km} km`, {
    sticky: true
  });
  staticLine.addTo(state.map);
  state.routingLayers.push(staticLine);

  // 2. Draw Bottleneck Hazard Markers along static route
  if (sc.static_route.bottlenecks) {
    sc.static_route.bottlenecks.forEach(bn => {
      const hazardIcon = L.divIcon({
        className: 'route-hazard-icon',
        html: '⚠️',
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      const m = L.marker(bn.coords, { icon: hazardIcon });
      m.bindPopup(`
        <div class="map-popup">
          <h5 class="bottleneck-popup-title">⚠️ NÚT THẮT TÊ LIỆT</h5>
          <strong class="bottleneck-popup-name">${bn.name}</strong>
          <p class="bottleneck-popup-description">Cấp: <strong>LOS ${bn.los}</strong> | Tốc độ bò: <strong>${bn.speed} km/h</strong><br/>${bn.desc}</p>
        </div>
      `);
      m.addTo(state.map);
      state.routingLayers.push(m);
    });
  }

  // 3. Draw Dynamic AI Route (Neon Cyan solid glow)
  const dynamicLine = L.polyline(sc.dynamic_route.path, {
    color: '#00f2fe',
    weight: 6.5,
    opacity: 0.95
  });
  dynamicLine.bindTooltip(`<strong>Đề Xuất AI (Động)</strong><br/>Khoảng cách: ${sc.dynamic_route.distance_km} km`, {
    sticky: true
  });
  dynamicLine.addTo(state.map);
  state.routingLayers.push(dynamicLine);

  // 4. Start & End Markers
  const startIcon = L.divIcon({
    className: 'route-start-icon',
    html: 'A',
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
  const startMarker = L.marker(sc.start.coords, { icon: startIcon });
  startMarker.bindPopup(`<strong>Xuất phát (A):</strong><br/>${sc.start.name}`);
  startMarker.addTo(state.map);
  state.routingLayers.push(startMarker);

  const endIcon = L.divIcon({
    className: 'route-end-icon',
    html: 'B',
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
  const endMarker = L.marker(sc.end.coords, { icon: endIcon });
  endMarker.bindPopup(`<strong>Đích đến (B):</strong><br/>${sc.end.name}`);
  endMarker.addTo(state.map);
  state.routingLayers.push(endMarker);

  // Fit bounds to display both routes
  const bounds = L.featureGroup([staticLine, dynamicLine]).getBounds();
  state.map.fitBounds(bounds, { padding: [60, 60] });

  // Update Briefing & Content
  document.getElementById('sc-icon').textContent = sc.icon;
  document.getElementById('sc-title').textContent = sc.name;
  document.getElementById('sc-sub').textContent = `${sc.start.name.split('(')[0]} ➔ ${sc.end.name.split('(')[0]}`;
  document.getElementById('sc-desc').textContent = sc.context;

  updateRouteMetricsForHour(state.currentHour);
}

function updateRouteMetricsForHour(hourFloat) {
  if (!state.data || !state.data.routing_scenarios) return;
  const sc = state.data.routing_scenarios[state.activeScenarioIndex];
  if (!sc) return;

  const hInt = Math.floor(hourFloat);
  const mInt = Math.round((hourFloat - hInt) * 60);
  const timeStr = `${String(hInt).padStart(2, '0')}:${String(mInt).padStart(2, '0')}`;
  
  const hourLbl = document.getElementById('route-current-hour-label');
  if (hourLbl) hourLbl.textContent = timeStr;

  // Factor based on hour
  let peakFactor = 0.35; // off peak
  if ((hourFloat >= 6.5 && hourFloat <= 9.0) || (hourFloat >= 16.5 && hourFloat <= 19.5)) {
    peakFactor = 1.0; // peak
  } else if (hourFloat >= 10.0 && hourFloat <= 16.0) {
    peakFactor = 0.55; // midday
  }

  // Calculate static and dynamic travel times
  const staticMaxTime = sc.static_route.peak_travel_time_min;
  const staticMinTime = Math.max(6.0, sc.static_route.distance_km * 2.5);
  const currentStaticTime = (staticMinTime + (staticMaxTime - staticMinTime) * peakFactor).toFixed(1);
  const currentStaticSpeed = Math.max(3.0, ((sc.static_route.distance_km / (currentStaticTime / 60))).toFixed(1));

  const dynamicMaxTime = sc.dynamic_route.peak_travel_time_min;
  const dynamicMinTime = Math.max(5.0, sc.dynamic_route.distance_km * 2.0);
  let currentDynamicTime = (dynamicMinTime + (dynamicMaxTime - dynamicMinTime) * (peakFactor * 0.4)).toFixed(1);
  
  // Ambulance mode bonus (faster priority)
  if (state.vehicleMode === 'emergency') {
    currentDynamicTime = Math.max(4.5, (currentDynamicTime * 0.85).toFixed(1));
  } else if (state.vehicleMode === 'bus') {
    currentDynamicTime = (currentDynamicTime * 1.15).toFixed(1);
  }

  const currentDynamicSpeed = ((sc.dynamic_route.distance_km / (currentDynamicTime / 60))).toFixed(1);
  const timeSaved = Math.max(1.0, (currentStaticTime - currentDynamicTime)).toFixed(1);
  const timeSavedPct = Math.round((timeSaved / currentStaticTime) * 100);

  // Update UI DOM
  document.getElementById('static-dist').textContent = `${sc.static_route.distance_km} km`;
  document.getElementById('static-time').textContent = `${currentStaticTime} phút`;
  document.getElementById('static-speed').textContent = `${currentStaticSpeed} km/h`;
  document.getElementById('static-bottlenecks').textContent = peakFactor > 0.6 ? `${sc.static_route.bottlenecks.length} nút tê liệt` : '1 nút nghẽn nhẹ';

  document.getElementById('dynamic-dist').textContent = `${sc.dynamic_route.distance_km} km`;
  document.getElementById('dynamic-time').textContent = `${currentDynamicTime} phút`;
  document.getElementById('dynamic-speed').textContent = `${currentDynamicSpeed} km/h`;
  document.getElementById('dynamic-bottlenecks').textContent = '0 nút (Làn sóng xanh)';

  document.getElementById('hl-time-saved').innerHTML = `⏱️ TIẾT KIỆM: <strong>${timeSaved} phút (-${timeSavedPct}%)</strong>`;
  document.getElementById('hl-co2-saved').innerHTML = `🌱 GIẢM PHÁT THẢI: <strong>-${Math.min(48, Math.round(timeSavedPct * 0.6))}% CO2</strong>`;
  document.getElementById('strategy-text').textContent = sc.dynamic_route.strategy_applied;
}

function resetRoutingView() {
  stopVehicleSimulation();
  renderActiveScenarioRoute();
}

// Vehicle moving animation along routes
function toggleVehicleSimulation() {
  if (state.vehicleAnimation.isRunning) {
    stopVehicleSimulation();
  } else {
    startVehicleSimulation();
  }
}

function stopVehicleSimulation() {
  if (state.vehicleAnimation.interval) {
    clearInterval(state.vehicleAnimation.interval);
    state.vehicleAnimation.interval = null;
  }
  if (state.vehicleAnimation.staticMarker) {
    state.map.removeLayer(state.vehicleAnimation.staticMarker);
    state.vehicleAnimation.staticMarker = null;
  }
  if (state.vehicleAnimation.dynamicMarker) {
    state.map.removeLayer(state.vehicleAnimation.dynamicMarker);
    state.vehicleAnimation.dynamicMarker = null;
  }
  state.vehicleAnimation.isRunning = false;

  const btn = document.getElementById('btn-start-vehicle-sim');
  if (btn) {
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      Bắt Đầu Mô Phỏng Xe Chạy
    `;
    btn.classList.remove('btn-success');
    btn.classList.add('btn-primary');
  }
}

function interpolatePath(points, progress) {
  if (!points || points.length === 0) return [0, 0];
  if (progress <= 0) return points[0];
  if (progress >= 1) return points[points.length - 1];

  const totalSegments = points.length - 1;
  const targetSeg = progress * totalSegments;
  const segIdx = Math.floor(targetSeg);
  const segFraction = targetSeg - segIdx;

  const p1 = points[Math.min(segIdx, points.length - 1)];
  const p2 = points[Math.min(segIdx + 1, points.length - 1)];

  const lat = p1[0] + (p2[0] - p1[0]) * segFraction;
  const lng = p1[1] + (p2[1] - p1[1]) * segFraction;
  return [lat, lng];
}

function startVehicleSimulation() {
  stopVehicleSimulation();
  state.vehicleAnimation.isRunning = true;

  const btn = document.getElementById('btn-start-vehicle-sim');
  if (btn) {
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
      Dừng Mô Phỏng Xe Chạy
    `;
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-success');
  }

  const sc = state.data.routing_scenarios[state.activeScenarioIndex];
  if (!sc) return;

  const staticPts = sc.static_route.path;
  const dynamicPts = sc.dynamic_route.path;

  // Icon for dynamic vehicle
  let dynIconHtml = '🚗';
  if (state.vehicleMode === 'emergency') dynIconHtml = '🚑';
  else if (state.vehicleMode === 'bus') dynIconHtml = '🚌';

  const dynamicIcon = L.divIcon({
    className: 'route-vehicle-icon',
    html: dynIconHtml,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  const staticIcon = L.divIcon({
    className: 'route-vehicle-icon',
    html: '🚗',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  state.vehicleAnimation.dynamicMarker = L.marker(dynamicPts[0], { icon: dynamicIcon }).addTo(state.map);
  state.vehicleAnimation.staticMarker = L.marker(staticPts[0], { icon: staticIcon }).addTo(state.map);

  let progressDynamic = 0.0;
  let progressStatic = 0.0;

  // Dynamic vehicle moves ~3.5x faster than static congested vehicle
  state.vehicleAnimation.interval = setInterval(() => {
    progressDynamic += 0.012; // Fast moving AI vehicle
    
    // Static vehicle crawls or gets delayed midway (around bottlenecks)
    if (progressStatic >= 0.35 && progressStatic <= 0.65) {
      progressStatic += 0.0012; // Crawling in gridlock
    } else {
      progressStatic += 0.004;
    }

    if (progressDynamic <= 1.0) {
      const posDyn = interpolatePath(dynamicPts, progressDynamic);
      state.vehicleAnimation.dynamicMarker.setLatLng(posDyn);
    }

    if (progressStatic <= 1.0) {
      const posStat = interpolatePath(staticPts, progressStatic);
      state.vehicleAnimation.staticMarker.setLatLng(posStat);
    }

    // When dynamic vehicle arrives
    if (progressDynamic >= 1.0) {
      clearInterval(state.vehicleAnimation.interval);
      state.vehicleAnimation.interval = null;
      state.vehicleAnimation.isRunning = false;
      if (btn) {
        btn.innerHTML = '✅ Xe Đề Xuất AI Đã Về Đích!';
        btn.classList.remove('btn-success');
        btn.classList.add('btn-primary');
      }
      state.vehicleAnimation.dynamicMarker.bindPopup(`<strong>🎉 Xe Đề Xuất AI Đã Về Đích!</strong><br/>Nhanh hơn gấp 3 lần, xe cũ vẫn đang bò tại ngã tư!`).openPopup();
    }
  }, 50);
}
