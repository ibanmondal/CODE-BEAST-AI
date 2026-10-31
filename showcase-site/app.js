/**
 * CODE BEAST AI — SHOWCASE PLATFORM LOGIC & INTERACTION ENGINE
 * Handles: Ambient Particle Canvas, Live Simulated Multi-Agent Audit,
 * Interactive Radar Visualizers, Archetype Interpolator, and App URL Router.
 */

// Global Configuration
const DEFAULT_APP_URL = "https://code-beast-ep13aimh-ibanmondals-projects.vercel.app";
let currentAppUrl = localStorage.getItem("codebeast_target_url") || DEFAULT_APP_URL;

// Update all launch buttons with active target URL
function updateLaunchLinks() {
  document.querySelectorAll(".launch-app-link").forEach(el => {
    el.setAttribute("href", currentAppUrl);
    el.setAttribute("target", "_blank");
  });
  const urlDisplay = document.getElementById("activeAppUrlText");
  if (urlDisplay) urlDisplay.textContent = currentAppUrl;
}

// ==========================================
// 1. Ambient Particle Constellation Canvas
// ==========================================
const canvas = document.getElementById("ambientCanvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let width, height;
  let particles = [];
  const PARTICLE_COUNT = 45;

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
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 1.6 + 0.8;
      this.alpha = Math.random() * 0.5 + 0.2;
      this.color = Math.random() > 0.4 ? "#00F2FE" : "#8B5CF6";
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
        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = "#38BDF8";
          ctx.globalAlpha = (1 - dist / 110) * 0.12;
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
// 2. Interactive Live Audit Simulator
// ==========================================
const sampleRepos = {
  flask: {
    url: "https://github.com/pallets/flask",
    overall: 93,
    tier: "Grand Champion Tier",
    sec: 96, arch: 94, perf: 92, orig: 95,
    logs: [
      "[00:01.05] POST /api/v1/evaluate received for pallets/flask",
      "[00:02.18] Cloning shallow tree: 84 files, 1.82s execution",
      "[00:03.40] Tree-Sitter AST: 242 function grammar nodes parsed",
      "[00:04.90] AutoReview Security: Zero hardcoded secrets, clean input bounds",
      "[00:06.10] Architecture Agent: WSGI micro-kernel separation verified",
      "[00:07.45] Performance Agent: Asymptotic runtime bounds O(1) routing dispatch",
      "[00:08.80] ConsJudge Consensus: High Confidence Badge issued (Variance ±0.8 pts)",
      "[00:09.95] Certificate generated: Signed by Dr. Mohammed Riyaz Ahmed & Dr. Tabassum Ara"
    ]
  },
  express: {
    url: "https://github.com/expressjs/express",
    overall: 91,
    tier: "Architecture Vanguard",
    sec: 92, arch: 95, perf: 90, orig: 94,
    logs: [
      "[00:01.02] POST /api/v1/evaluate received for expressjs/express",
      "[00:02.30] Shallow clone complete (depth=1, 42 files)",
      "[00:03.65] Tree-Sitter AST Javascript: Middleware pipeline grammar mapped",
      "[00:05.10] AutoReview Security: Safe prototype pollution guards confirmed",
      "[00:06.50] Architecture Agent: Clean Unix philosophy, minimal dependencies",
      "[00:07.80] Originality Engine: 94.2% verified AST uniqueness",
      "[00:09.10] ConsJudge Consensus: Dual-pass match 91 / 90.5 (Variance ±0.5 pts)",
      "[00:10.15] Completed in 9.2s. Standings synced to Global Leaderboard."
    ]
  },
  hackathon: {
    url: "https://github.com/student-cohort/ai-medtech-mvp",
    overall: 84,
    tier: "First Class Honors",
    sec: 82, arch: 86, perf: 81, orig: 91,
    logs: [
      "[00:01.10] POST /api/v1/evaluate received for ai-medtech-mvp",
      "[00:02.40] Cloned student repository in 1.4s",
      "[00:03.80] Tree-Sitter AST: FastAPI + PyTorch CNN layer nodes identified",
      "[00:05.20] AutoReview Security: CWE-798 Hardcoded test token flagged in dev config",
      "[00:05.80] AutoReview Patch: Generated unified git diff repair in security audit",
      "[00:07.10] Architecture Agent: Good modular split, async DB session recommended",
      "[00:08.40] Originality Engine: 91.4% unique code vs baseline templates",
      "[00:09.70] Institutional Certificate sealed with Principal & Dean signatures"
    ]
  }
};

const simTerminal = document.getElementById("simTerminal");
const simScoreText = document.getElementById("simScoreText");
const simTierText = document.getElementById("simTierText");
const simRepoInput = document.getElementById("simRepoInput");
const simRunBtn = document.getElementById("simRunBtn");

function runSimulation(presetKey = "flask") {
  const data = sampleRepos[presetKey] || sampleRepos.flask;
  if (simRepoInput) simRepoInput.value = data.url;

  if (simTerminal) simTerminal.innerHTML = "";
  if (simScoreText) simScoreText.textContent = "--";
  if (simTierText) simTierText.textContent = "Analyzing AST & Agents...";

  if (simRunBtn) {
    simRunBtn.disabled = true;
    simRunBtn.textContent = "Analyzing...";
  }

  let index = 0;
  const interval = setInterval(() => {
    if (index < data.logs.length) {
      const line = document.createElement("div");
      line.className = "sim-line";
      const log = data.logs[index];
      line.innerHTML = `<span class="sim-time">[${new Date().toLocaleTimeString().slice(3)}]</span> <span class="sim-cyan">${log}</span>`;
      if (simTerminal) {
        simTerminal.appendChild(line);
        simTerminal.scrollTop = simTerminal.scrollHeight;
      }
      index++;
    } else {
      clearInterval(interval);
      animateCounter(simScoreText, 0, data.overall, 600);
      if (simTierText) simTierText.textContent = data.tier;
      if (simRunBtn) {
        simRunBtn.disabled = false;
        simRunBtn.textContent = "Simulate Audit";
      }
    }
  }, 450);
}

function animateCounter(element, start, end, duration) {
  if (!element) return;
  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    element.textContent = value < 10 ? `0${value}` : value;
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  requestAnimationFrame(update);
}

// Preset chips click
document.querySelectorAll(".sample-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    const preset = chip.getAttribute("data-preset");
    runSimulation(preset);
  });
});

if (simRunBtn) {
  simRunBtn.addEventListener("click", () => {
    runSimulation("flask");
  });
}

// ==========================================
// 3. Interactive Archetype Radar Chart
// ==========================================
const bigRadarCanvas = document.getElementById("bigRadarCanvas");
const archetypes = {
  microservice: {
    title: "Enterprise FastAPI Microservice",
    score: 93,
    values: [0.96, 0.94, 0.92, 0.95, 0.88, 0.90], // Sec, Arch, Perf, Orig, Test, DB
    labels: ["Security (96%)", "Architecture (94%)", "Performance (92%)", "Originality (95%)", "Testing (88%)", "Database (90%)"]
  },
  nextjs: {
    title: "Next.js 14 Fullstack App",
    score: 89,
    values: [0.90, 0.92, 0.89, 0.94, 0.84, 0.86],
    labels: ["Security (90%)", "Architecture (92%)", "Performance (89%)", "Originality (94%)", "Testing (84%)", "Database (86%)"]
  },
  ai_pipeline: {
    title: "AI / ML PyTorch Research Pipeline",
    score: 87,
    values: [0.85, 0.88, 0.95, 0.98, 0.78, 0.80],
    labels: ["Security (85%)", "Architecture (88%)", "Performance (95%)", "Originality (98%)", "Testing (78%)", "Database (80%)"]
  },
  hackathon_mvp: {
    title: "Unchecked Hackathon MVP",
    score: 52,
    values: [0.48, 0.55, 0.60, 0.42, 0.35, 0.45],
    labels: ["Security (48%)", "Architecture (55%)", "Performance (60%)", "Originality (42%)", "Testing (35%)", "Database (45%)"]
  }
};

let currentArchetype = archetypes.microservice;
let currentInterpolatedValues = [...currentArchetype.values];
let targetValues = [...currentArchetype.values];

function drawBigRadar() {
  if (!bigRadarCanvas) return;
  const ctx = bigRadarCanvas.getContext("2d");
  const w = bigRadarCanvas.width;
  const h = bigRadarCanvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const radius = 110;
  const axes = ["Security", "Architecture", "Performance", "Originality", "Testing", "Database"];

  ctx.clearRect(0, 0, w, h);

  // Background concentric webs
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
  ctx.font = "11px 'Fira Code', monospace";
  ctx.fillStyle = "#94A3B8";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    ctx.stroke();

    // Label position slightly outside
    const lx = cx + Math.cos(angle) * (radius + 22);
    const ly = cy + Math.sin(angle) * (radius + 22);
    ctx.fillText(axes[i], lx, ly);
  }

  // Smooth interpolation towards target values
  let moving = false;
  for (let i = 0; i < 6; i++) {
    const diff = targetValues[i] - currentInterpolatedValues[i];
    if (Math.abs(diff) > 0.005) {
      currentInterpolatedValues[i] += diff * 0.12;
      moving = true;
    } else {
      currentInterpolatedValues[i] = targetValues[i];
    }
  }

  // Draw data polygon
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
    const val = currentInterpolatedValues[i];
    const x = cx + Math.cos(angle) * (radius * val);
    const y = cy + Math.sin(angle) * (radius * val);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(0, 242, 254, 0.22)";
  ctx.fill();
  ctx.strokeStyle = "#00F2FE";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Draw data vertices
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
    const val = currentInterpolatedValues[i];
    const x = cx + Math.cos(angle) * (radius * val);
    const y = cy + Math.sin(angle) * (radius * val);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.strokeStyle = "#00F2FE";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  requestAnimationFrame(drawBigRadar);
}

// Archetype buttons click
document.querySelectorAll(".archetype-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".archetype-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const key = btn.getAttribute("data-arch");
    if (archetypes[key]) {
      targetValues = [...archetypes[key].values];
      const scoreBadge = document.getElementById("activeArchScore");
      if (scoreBadge) scoreBadge.textContent = archetypes[key].score;
    }
  });
});

if (bigRadarCanvas) {
  drawBigRadar();
}

// ==========================================
// 4. FAQ Accordion Toggle
// ==========================================
document.querySelectorAll(".faq-item").forEach(item => {
  const header = item.querySelector(".faq-header");
  header.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item").forEach(i => i.classList.remove("open"));
    if (!isOpen) {
      item.classList.add("open");
    }
  });
});

// ==========================================
// 5. Navbar Scroll Elevation
// ==========================================
const navbar = document.querySelector(".navbar");
window.addEventListener("scroll", () => {
  if (navbar) {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }
});

// ==========================================
// 6. Custom App URL Config Modal
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
    showToast("Reset to default Vercel deployment URL");
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
  runSimulation("flask");
});
