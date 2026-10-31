/**
 * CODE BEAST AI — SHOWCASE PLATFORM LOGIC & INTERACTION ENGINE
 * Enterprise developer experience: Zero emojis, ambient particle mesh,
 * simulated multi-agent telemetry, and dynamic 6-axis radar interpolations.
 */

// Global Configuration: Live Production Vercel URL
const DEFAULT_APP_URL = "https://code-beast-99if6grx2-ibanmondals-projects.vercel.app/";
let currentAppUrl = localStorage.getItem("codebeast_target_url") || DEFAULT_APP_URL;

// Update all launch buttons with active target URL
function updateLaunchLinks() {
  document.querySelectorAll(".launch-app-link").forEach(el => {
    const href = el.getAttribute("href");
    if (href) {
      if (href.includes("/judges")) {
        el.setAttribute("href", currentAppUrl.replace(/\/$/, "") + "/judges");
      } else if (href.includes("/leaderboard")) {
        el.setAttribute("href", currentAppUrl.replace(/\/$/, "") + "/leaderboard");
      } else if (href.includes("/duel")) {
        el.setAttribute("href", currentAppUrl.replace(/\/$/, "") + "/duel");
      } else if (href.includes("/upload")) {
        el.setAttribute("href", currentAppUrl.replace(/\/$/, "") + "/upload");
      } else {
        el.setAttribute("href", currentAppUrl);
      }
    } else {
      el.setAttribute("href", currentAppUrl);
    }
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  });

  const urlDisplay = document.getElementById("activeAppUrlText");
  if (urlDisplay) urlDisplay.textContent = currentAppUrl;
}

// ==========================================
// 1. Ambient Particle Mesh Canvas
// ==========================================
const canvas = document.getElementById("ambientCanvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let width, height;
  let particles = [];
  const PARTICLE_COUNT = 40;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.radius = Math.random() * 1.5 + 0.6;
      this.alpha = Math.random() * 0.4 + 0.15;
      this.color = Math.random() > 0.5 ? "#06B6D4" : "#6366F1";
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = "#38BDF8";
          ctx.globalAlpha = (1 - dist / 100) * 0.08;
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

// ==========================================
// 2. Interactive Simulator Cockpit
// ==========================================
const sampleRepos = {
  flask: {
    url: "https://github.com/pallets/flask",
    overall: 93,
    tier: "Grand Champion Tier",
    radar: [0.96, 0.94, 0.92, 0.95, 0.88, 0.90],
    logs: [
      "[00:01.05] POST /api/v1/evaluate received for pallets/flask",
      "[00:02.18] Ingestion: Cloned shallow tree (84 files, 1.82s execution)",
      "[00:03.40] Tree-Sitter AST: 242 function grammar nodes parsed (< 5MB RAM)",
      "[00:04.90] AutoReview Security: Zero hardcoded secrets, clean input sanitization",
      "[00:06.10] Architecture Agent: WSGI micro-kernel modular separation verified",
      "[00:07.45] Performance Agent: Asymptotic runtime bounds O(1) routing dispatch",
      "[00:08.80] ConsJudge Consensus: High Confidence Badge issued (Variance ±0.8 pts)",
      "[00:09.95] Certificate Sealed: Dr. Mohammed Riyaz Ahmed & Dr. Tabassum Ara"
    ]
  },
  express: {
    url: "https://github.com/expressjs/express",
    overall: 91,
    tier: "Architecture Vanguard",
    radar: [0.92, 0.95, 0.90, 0.94, 0.86, 0.88],
    logs: [
      "[00:01.02] POST /api/v1/evaluate received for expressjs/express",
      "[00:02.30] Ingestion: Shallow clone complete (depth=1, 42 files)",
      "[00:03.65] Tree-Sitter AST JS: Middleware pipeline grammar mapped",
      "[00:05.10] AutoReview Security: Prototype pollution guards confirmed",
      "[00:06.50] Architecture Agent: Clean Unix philosophy, minimal dependencies",
      "[00:07.80] Originality Engine: 94.2% verified AST uniqueness vs template corpus",
      "[00:09.10] ConsJudge Consensus: Dual-pass match 91 / 90.5 (Variance ±0.5 pts)",
      "[00:10.15] Completed in 9.2s. Standings synced to Global Leaderboard."
    ]
  },
  hackathon: {
    url: "https://github.com/student-cohort/ai-medtech-mvp",
    overall: 84,
    tier: "First Class Honors",
    radar: [0.82, 0.86, 0.81, 0.91, 0.78, 0.84],
    logs: [
      "[00:01.10] POST /api/v1/evaluate received for ai-medtech-mvp",
      "[00:02.40] Ingestion: Cloned student repository in 1.4s",
      "[00:03.80] Tree-Sitter AST: FastAPI + PyTorch CNN layer nodes identified",
      "[00:05.20] AutoReview Security: CWE-798 Hardcoded test token flagged in dev config",
      "[00:05.80] AutoReview Patch: Synthesized unified git diff repair in security audit",
      "[00:07.10] Architecture Agent: Good modular split, async DB session recommended",
      "[00:08.40] Originality Engine: 91.4% unique code vs baseline templates",
      "[00:09.70] Institutional Certificate sealed with Principal & Dean signatures"
    ]
  }
};

const cockpitTerminal = document.getElementById("cockpitTerminal");
const cockpitScoreVal = document.getElementById("cockpitScoreVal");
const cockpitTierBadge = document.getElementById("cockpitTierBadge");
const cockpitInput = document.getElementById("cockpitInput");
const cockpitRunBtn = document.getElementById("cockpitRunBtn");

let activeRadarTarget = [...sampleRepos.flask.radar];
let activeRadarCurrent = [...sampleRepos.flask.radar];

function runCockpitSimulation(presetKey = "flask") {
  const data = sampleRepos[presetKey] || sampleRepos.flask;
  if (cockpitInput) cockpitInput.value = data.url;

  if (cockpitTerminal) cockpitTerminal.innerHTML = "";
  if (cockpitScoreVal) cockpitScoreVal.textContent = "--";
  if (cockpitTierBadge) cockpitTierBadge.textContent = "Analyzing AST & Agents...";

  if (cockpitRunBtn) {
    cockpitRunBtn.disabled = true;
    cockpitRunBtn.textContent = "Analyzing...";
  }

  activeRadarTarget = [...data.radar];

  let index = 0;
  const interval = setInterval(() => {
    if (index < data.logs.length) {
      const line = document.createElement("div");
      line.className = "term-line";
      const log = data.logs[index];
      line.innerHTML = `<span class="term-time">[${new Date().toLocaleTimeString().slice(3)}]</span> <span class="term-log info">${log}</span>`;
      if (cockpitTerminal) {
        cockpitTerminal.appendChild(line);
        cockpitTerminal.scrollTop = cockpitTerminal.scrollHeight;
      }
      index++;
    } else {
      clearInterval(interval);
      animateScoreCounter(cockpitScoreVal, 0, data.overall, 500);
      if (cockpitTierBadge) cockpitTierBadge.textContent = data.tier;
      if (cockpitRunBtn) {
        cockpitRunBtn.disabled = false;
        cockpitRunBtn.textContent = "Run Simulation";
      }
    }
  }, 420);
}

function animateScoreCounter(el, start, end, duration) {
  if (!el) return;
  const startTime = performance.now();
  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const val = Math.floor(progress * (end - start) + start);
    el.textContent = val < 10 ? `0${val}` : val;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// Preset chips click
document.querySelectorAll(".chip-btn").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip-btn").forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    const preset = chip.getAttribute("data-preset");
    runCockpitSimulation(preset);
  });
});

if (cockpitRunBtn) {
  cockpitRunBtn.addEventListener("click", () => {
    runCockpitSimulation("flask");
  });
}

// ==========================================
// 3. Radar Chart Canvas Visualizer
// ==========================================
const radarCanvas = document.getElementById("cockpitRadarCanvas");

function drawCockpitRadar() {
  if (!radarCanvas) return;
  const ctx = radarCanvas.getContext("2d");
  const w = radarCanvas.width;
  const h = radarCanvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const radius = 95;
  const axes = ["Security", "Architecture", "Performance", "Originality", "Testing", "Database"];

  ctx.clearRect(0, 0, w, h);

  // Concentric webs
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  for (let level = 1; level <= 4; level++) {
    ctx.beginPath();
    const r = (radius / 4) * level;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Radial spokes & labels
  ctx.font = "10px 'Fira Code', monospace";
  ctx.fillStyle = "#94A3B8";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    ctx.stroke();

    const lx = cx + Math.cos(angle) * (radius + 18);
    const ly = cy + Math.sin(angle) * (radius + 18);
    ctx.fillText(axes[i], lx, ly);
  }

  // Smooth interpolation towards target values
  for (let i = 0; i < 6; i++) {
    const diff = activeRadarTarget[i] - activeRadarCurrent[i];
    if (Math.abs(diff) > 0.005) {
      activeRadarCurrent[i] += diff * 0.12;
    } else {
      activeRadarCurrent[i] = activeRadarTarget[i];
    }
  }

  // Draw data polygon
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
    const val = activeRadarCurrent[i];
    const x = cx + Math.cos(angle) * (radius * val);
    const y = cy + Math.sin(angle) * (radius * val);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(6, 182, 212, 0.22)";
  ctx.fill();
  ctx.strokeStyle = "#06B6D4";
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // Draw vertices
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
    const val = activeRadarCurrent[i];
    const x = cx + Math.cos(angle) * (radius * val);
    const y = cy + Math.sin(angle) * (radius * val);
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.strokeStyle = "#06B6D4";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  requestAnimationFrame(drawCockpitRadar);
}

if (radarCanvas) {
  drawCockpitRadar();
}

// ==========================================
// 4. FAQ Accordion Toggle
// ==========================================
document.querySelectorAll(".faq-card").forEach(card => {
  const q = card.querySelector(".faq-question");
  q.addEventListener("click", () => {
    const isOpen = card.classList.contains("open");
    document.querySelectorAll(".faq-card").forEach(c => c.classList.remove("open"));
    if (!isOpen) card.classList.add("open");
  });
});

// ==========================================
// 5. Navbar Scroll Shadow
// ==========================================
const navbar = document.querySelector(".navbar");
window.addEventListener("scroll", () => {
  if (navbar) {
    if (window.scrollY > 30) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  }
});

// ==========================================
// 6. Target URL Modal Configuration
// ==========================================
const configModal = document.getElementById("configModal");
const openConfigBtn = document.getElementById("openConfigBtn");
const closeConfigBtn = document.getElementById("closeConfigBtn");
const saveConfigBtn = document.getElementById("saveConfigBtn");
const targetUrlInput = document.getElementById("targetUrlInput");
const resetUrlBtn = document.getElementById("resetUrlBtn");

if (openConfigBtn && configModal) {
  openConfigBtn.addEventListener("click", () => {
    if (targetUrlInput) targetUrlInput.value = currentAppUrl;
    configModal.classList.add("open");
  });
}

if (closeConfigBtn && configModal) {
  closeConfigBtn.addEventListener("click", () => {
    configModal.classList.remove("open");
  });
}

if (saveConfigBtn && configModal) {
  saveConfigBtn.addEventListener("click", () => {
    let newUrl = targetUrlInput ? targetUrlInput.value.trim() : "";
    if (newUrl) {
      if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://")) {
        newUrl = "https://" + newUrl;
      }
      currentAppUrl = newUrl;
      localStorage.setItem("codebeast_target_url", currentAppUrl);
      updateLaunchLinks();
      configModal.classList.remove("open");
      showToast("App URL updated: " + currentAppUrl);
    }
  });
}

if (resetUrlBtn && configModal) {
  resetUrlBtn.addEventListener("click", () => {
    currentAppUrl = DEFAULT_APP_URL;
    localStorage.removeItem("codebeast_target_url");
    if (targetUrlInput) targetUrlInput.value = DEFAULT_APP_URL;
    updateLaunchLinks();
    configModal.classList.remove("open");
    showToast("Reset to live Vercel URL");
  });
}

function showToast(msg) {
  const toast = document.createElement("div");
  toast.style.position = "fixed";
  toast.style.bottom = "24px";
  toast.style.right = "24px";
  toast.style.background = "#10B981";
  toast.style.color = "#030712";
  toast.style.padding = "10px 18px";
  toast.style.borderRadius = "8px";
  toast.style.fontWeight = "700";
  toast.style.fontSize = "13px";
  toast.style.boxShadow = "0 8px 24px rgba(0,0,0,0.5)";
  toast.style.zIndex = "9999";
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Initialize on Load
document.addEventListener("DOMContentLoaded", () => {
  updateLaunchLinks();
  runCockpitSimulation("flask");
});
