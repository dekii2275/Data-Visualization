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
  await loadTrafficData();
  updateDashboard(state.currentHour);
});

// ==========================================================================
// MAP INITIALIZATION (Leaflet + Dark Matter Tiles)
// ==========================================================================
function initMap() {
  // Center on District 10 / Tan Binh / Central HCMC
  state.map = L.map('traffic-map', {
    center: [10.7765, 106.6620],
    zoom: 13,
    zoomControl: false,
    attributionControl: false
  });

  // Dark Matter tiles for high-tech IOC aesthetic
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    subdomains: 'abcd'
  }).addTo(state.map);

  // Zoom control in bottom left
  L.control.zoom({ position: 'bottomleft' }).addTo(state.map);
}

// ==========================================================================
// LOAD DATA
// ==========================================================================
async function loadTrafficData() {
  try {
    const res = await fetch('traffic_data.json');
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    state.data = await res.json();
    console.log('[IOC] Traffic data loaded:', state.data);

    renderHotspots();
    renderSegments();
    populateHotspotsList();
  } catch (err) {
    console.error('[IOC] Failed to load traffic_data.json:', err);
    alert('Không thể nạp dữ liệu traffic_data.json. Đang chạy trong môi trường cục bộ.');
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
      <div style="font-family: var(--font-sans); color: #111; max-width: 220px;">
        <h5 style="margin: 0 0 4px; font-size: 13px; color: #d32f2f;">🔥 ${hp.name}</h5>
        <p style="margin: 0; font-size: 11px; color: #555;">${hp.desc}</p>
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
