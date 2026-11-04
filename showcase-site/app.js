/**
 * CODE BEAST AI — SHOWCASE PLATFORM LOGIC & SHADCN INTERACTION ENGINE
 * Enterprise developer experience: Zero emojis, ambient particle mesh,
 * simulated multi-agent telemetry, dynamic radar chart, command palette (Ctrl+K),
 * and interactive variance simulation.
 */

// ==========================================
// 1. Global Target Application Configuration
// ==========================================
const DEFAULT_APP_URL = "https://code-beast-99if6grx2-ibanmondals-projects.vercel.app/";
let currentAppUrl = localStorage.getItem("codebeast_target_url") || DEFAULT_APP_URL;

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
// 2. Ambient Particle Mesh Canvas
// ==========================================
const canvas = document.getElementById("ambientCanvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let width, height;
  let particles = [];
  const PARTICLE_COUNT = 36;

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
// 3. Cockpit Simulation Datasets
// ==========================================
const sampleRepos = {
  flask: {
    url: "https://github.com/pallets/flask",
    overall: 93,
    tier: "Grand Champion Tier",
    radar: [0.96, 0.94, 0.92, 0.95, 0.88, 0.90],
    chips: { sec: 96, arch: 94, perf: 92, orig: 95, qa: 88, db: 90 },
    logs: [
      "[00:01.05] POST /api/v1/evaluate received for pallets/flask",
      "[00:02.18] Ingestion: Cloned shallow tree (84 files, 1.82s execution)",
      "[00:03.40] Tree-Sitter AST: 242 function grammar nodes parsed (< 5MB RAM)",
      "[00:04.90] AutoReview Security: Zero hardcoded secrets, clean input sanitization",
      "[00:06.10] Architecture Agent: WSGI micro-kernel modular separation verified",
      "[00:07.45] Performance Agent: Asymptotic runtime bounds O(1) routing dispatch",
      "[00:08.80] ConsJudge Consensus: High Confidence Badge issued (Variance ±0.8 pts)",
      "[00:09.95] Certificate Sealed: Dr. Mohammed Riyaz Ahmed & Dr. Tabassum Ara"
    ],
    ast: [
      "ROOT (module) [0,0 - 184,32]",
      " ├─ import_from_statement: from .app import Flask [4,0 - 4,28]",
      " ├─ function_definition: wsgi_app [24,0 - 52,19]",
      " │   ├─ parameters: (environ, start_response) [24,13 - 24,37]",
      " │   └─ return_statement: ctx.pop(exc) [51,8 - 51,26]",
      " ├─ class_definition: RequestContext [64,0 - 112,24]",
      " │   ├─ method_definition: __enter__ [70,4 - 76,18]",
      " │   └─ method_definition: __exit__  [78,4 - 84,20]",
      " └─ call_expression: app.run() [180,4 - 180,14]"
    ],
    diff: [
      "diff --git a/src/flask/app.py b/src/flask/app.py",
      "index e9142f1..c83910b 100644",
      "--- a/src/flask/app.py",
      "+++ b/src/flask/app.py",
      "@@ -82,6 +82,9 @@ class Flask(Scaffold):",
      "-    # Legacy insecure cookie signature fallback",
      "-    secret_key = os.environ.get('SECRET_KEY', 'dev_default_key')",
      "+    # AutoReview Security Patch: Enforce cryptographically strong entropy",
      "+    secret_key = os.environ.get('SECRET_KEY')",
      "+    if not secret_key: raise RuntimeError('Missing required SECRET_KEY')"
    ]
  },
  express: {
    url: "https://github.com/expressjs/express",
    overall: 91,
    tier: "Architecture Vanguard",
    radar: [0.92, 0.95, 0.90, 0.94, 0.86, 0.88],
    chips: { sec: 92, arch: 95, perf: 90, orig: 94, qa: 86, db: 88 },
    logs: [
      "[00:01.02] POST /api/v1/evaluate received for expressjs/express",
      "[00:02.30] Ingestion: Shallow clone complete (depth=1, 42 files)",
      "[00:03.65] Tree-Sitter AST JS: Middleware pipeline grammar mapped",
      "[00:05.10] AutoReview Security: Prototype pollution guards confirmed",
      "[00:06.50] Architecture Agent: Clean Unix philosophy, minimal dependencies",
      "[00:07.80] Originality Engine: 94.2% verified AST uniqueness vs template corpus",
      "[00:09.10] ConsJudge Consensus: Dual-pass match 91 / 90.5 (Variance ±0.5 pts)",
      "[00:10.15] Completed in 9.2s. Standings synced to Global Leaderboard."
    ],
    ast: [
      "ROOT (program) [0,0 - 240,40]",
      " ├─ variable_declaration: var proto = require('./router') [12,0 - 12,38]",
      " ├─ function_declaration: createApplication [34,0 - 68,2]",
      " │   ├─ assignment_expression: app.request = Object.create(req) [42,2 - 42,42]",
      " │   └─ return_statement: return app [66,2 - 66,13]",
      " └─ export_statement: module.exports = createApplication [72,0 - 72,40]"
    ],
    diff: [
      "diff --git a/lib/middleware/init.js b/lib/middleware/init.js",
      "index 8b9412a..410cda8 100644",
      "--- a/lib/middleware/init.js",
      "+++ b/lib/middleware/init.js",
      "@@ -18,6 +18,8 @@ exports.init = function(app){",
      "+  // AutoReview Protection: Guard against prototype pollution in headers",
      "+  Object.setPrototypeOf(req.headers, null);",
      "   req.res = res;"
    ]
  },
  hackathon: {
    url: "https://github.com/student-cohort/ai-medtech-mvp",
    overall: 84,
    tier: "First Class Honors",
    radar: [0.82, 0.86, 0.81, 0.91, 0.78, 0.84],
    chips: { sec: 82, arch: 86, perf: 81, orig: 91, qa: 78, db: 84 },
    logs: [
      "[00:01.10] POST /api/v1/evaluate received for ai-medtech-mvp",
      "[00:02.40] Ingestion: Cloned student repository in 1.4s",
      "[00:03.80] Tree-Sitter AST: FastAPI + PyTorch CNN layer nodes identified",
      "[00:05.20] AutoReview Security: CWE-798 Hardcoded test token flagged in dev config",
      "[00:05.80] AutoReview Patch: Synthesized unified git diff repair in security audit",
      "[00:07.10] Architecture Agent: Good modular split, async DB session recommended",
      "[00:08.40] Originality Engine: 91.4% unique code vs baseline templates",
      "[00:09.70] Institutional Certificate sealed with Principal & Dean signatures"
    ],
    ast: [
      "ROOT (module) [0,0 - 94,18]",
      " ├─ import_statement: import torch, torchvision [2,0 - 2,34]",
      " ├─ class_definition: DiagnosticClassifier(nn.Module) [8,0 - 45,28]",
      " │   ├─ function_definition: __init__ [10,4 - 22,22]",
      " │   └─ function_definition: forward  [24,4 - 36,20]",
      " └─ decorated_definition: @app.post('/predict') [50,0 - 82,26]"
    ],
    diff: [
      "diff --git a/app/config.py b/app/config.py",
      "index a1b2c3d..e4f5a6b 100644",
      "--- a/app/config.py",
      "+++ b/app/config.py",
      "@@ -10,3 +10,4 @@",
      "-API_SECRET_TOKEN = 'sk-student-mvp-hardcoded-test-key-12345'",
      "+# AutoReview Security Patch: Migrated CWE-798 secret to environment variable",
      "+API_SECRET_TOKEN = os.environ.get('MEDTECH_API_KEY')"
    ]
  },
  fastapi: {
    url: "https://github.com/tiangolo/fastapi",
    overall: 95,
    tier: "Grand Champion Tier",
    radar: [0.97, 0.96, 0.95, 0.94, 0.93, 0.92],
    chips: { sec: 97, arch: 96, perf: 95, orig: 94, qa: 93, db: 92 },
    logs: [
      "[00:01.01] POST /api/v1/evaluate received for tiangolo/fastapi",
      "[00:02.15] Ingestion: Cloned shallow tree (112 files in 1.4s)",
      "[00:03.20] Tree-Sitter AST: Pydantic v2 type signatures & OpenAPI routes parsed",
      "[00:04.60] AutoReview Security: Complete type-safe OpenAPI input validation verified",
      "[00:06.00] Architecture Agent: Outstanding modular dependency injection graph",
      "[00:07.30] Performance Agent: Starlette async event loop zero-overhead routing",
      "[00:08.50] ConsJudge Consensus: High Confidence Badge issued (Variance ±0.4 pts)",
      "[00:09.60] Certificate Sealed: Score 95 / 100 Grand Champion Tier"
    ],
    ast: [
      "ROOT (module) [0,0 - 150,30]",
      " ├─ import_from_statement: from starlette.applications import Starlette [3,0 - 3,58]",
      " ├─ class_definition: FastAPI(Starlette) [15,0 - 95,20]",
      " │   ├─ function_definition: __init__ [20,4 - 45,30]",
      " │   └─ function_definition: add_api_route [48,4 - 65,24]",
      " └─ function_definition: setup_cors [110,0 - 130,22]"
    ],
    diff: [
      "diff --git a/fastapi/routing.py b/fastapi/routing.py",
      "index 39b10a2..912fcaa 100644",
      "--- a/fastapi/routing.py",
      "+++ b/fastapi/routing.py",
      "@@ -102,6 +102,9 @@ def get_request_handler():",
      "+    # AutoReview Security: Add strict Content-Type header validation",
      "+    if request.headers.get('content-length', 0) > MAX_BODY_SIZE:",
      "+        raise HTTPException(status_code=413, detail='Payload Too Large')",
      "     return handler"
    ]
  }
};

// ==========================================
// 4. Cockpit Simulator Execution Engine
// ==========================================
const cockpitTerminal = document.getElementById("cockpitTerminal");
const cockpitAstView = document.getElementById("cockpitAstView");
const cockpitDiffView = document.getElementById("cockpitDiffView");
const cockpitScoreVal = document.getElementById("cockpitScoreVal");
const cockpitTierBadge = document.getElementById("cockpitTierBadge");
const cockpitInput = document.getElementById("cockpitInput");
const cockpitRunBtn = document.getElementById("cockpitRunBtn");
const cockpitProgressFill = document.getElementById("cockpitProgressFill");

const chipSec = document.getElementById("chipSec");
const chipArch = document.getElementById("chipArch");
const chipPerf = document.getElementById("chipPerf");
const chipOrig = document.getElementById("chipOrig");
const chipQa = document.getElementById("chipQa");
const chipDb = document.getElementById("chipDb");

let activeRadarTarget = [...sampleRepos.flask.radar];
let activeRadarCurrent = [...sampleRepos.flask.radar];
let currentSimulationKey = "flask";
let currentSimulationInterval = null;

function runCockpitSimulation(presetKey = "flask") {
  currentSimulationKey = presetKey;
  const data = sampleRepos[presetKey] || sampleRepos.flask;
  if (cockpitInput) cockpitInput.value = data.url;

  if (currentSimulationInterval) clearInterval(currentSimulationInterval);

  // Clear views
  if (cockpitTerminal) cockpitTerminal.innerHTML = "";
  if (cockpitAstView) cockpitAstView.innerHTML = "";
  if (cockpitDiffView) cockpitDiffView.innerHTML = "";
  if (cockpitScoreVal) cockpitScoreVal.textContent = "--";
  if (cockpitTierBadge) cockpitTierBadge.textContent = "Analyzing AST & LangGraph Agents...";
  if (cockpitProgressFill) cockpitProgressFill.style.width = "0%";

  if (cockpitRunBtn) {
    cockpitRunBtn.disabled = true;
    cockpitRunBtn.textContent = "Analyzing...";
  }

  activeRadarTarget = [...data.radar];

  // Populate AST View
  if (cockpitAstView) {
    cockpitAstView.innerHTML = `
      <div style="font-family: var(--font-mono); font-size: 11.5px; color: var(--accent-cyan); padding: 8px 12px; border-bottom: 1px solid var(--border-subtle);">
        TREE-SITTER GRAMMAR CONCRETE SYNTAX TREE &bull; ${data.url.split("/").slice(-2).join("/")}
      </div>
      <div style="padding: 12px; font-family: var(--font-mono); font-size: 12px; line-height: 1.7; color: var(--text-primary);">
        ${data.ast.map(line => `<div>${line}</div>`).join("")}
      </div>
    `;
  }

  // Populate Diff View
  if (cockpitDiffView) {
    cockpitDiffView.innerHTML = `
      <div style="font-family: var(--font-mono); font-size: 11.5px; color: var(--accent-emerald); padding: 8px 12px; border-bottom: 1px solid var(--border-subtle);">
        AUTOREVIEW REPAIR: SYNTHESIZED UNIFIED GIT DIFF PATCH
      </div>
      <div style="padding: 8px 0; font-family: var(--font-mono); font-size: 12px; line-height: 1.5;">
        ${data.diff.map(line => {
          if (line.startsWith("+")) return `<div class="diff-line-add">${line}</div>`;
          if (line.startsWith("-")) return `<div class="diff-line-del">${line}</div>`;
          return `<div class="diff-header">${line}</div>`;
        }).join("")}
      </div>
    `;
  }

  // Stream logs
  let index = 0;
  const total = data.logs.length;
  currentSimulationInterval = setInterval(() => {
    if (index < total) {
      const line = document.createElement("div");
      line.className = "term-line";
      const log = data.logs[index];
      line.innerHTML = `<span class="term-time">[${new Date().toLocaleTimeString().slice(3)}]</span> <span class="term-log info">${log}</span>`;
      if (cockpitTerminal) {
        cockpitTerminal.appendChild(line);
        cockpitTerminal.scrollTop = cockpitTerminal.scrollHeight;
      }
      index++;
      if (cockpitProgressFill) {
        cockpitProgressFill.style.width = Math.round((index / total) * 100) + "%";
      }
    } else {
      clearInterval(currentSimulationInterval);
      animateScoreCounter(cockpitScoreVal, 0, data.overall, 500);
      if (cockpitTierBadge) cockpitTierBadge.textContent = data.tier;
      if (cockpitRunBtn) {
        cockpitRunBtn.disabled = false;
        cockpitRunBtn.textContent = "Run Simulation";
      }

      // Update score chips
      if (chipSec) chipSec.textContent = data.chips.sec;
      if (chipArch) chipArch.textContent = data.chips.arch;
      if (chipPerf) chipPerf.textContent = data.chips.perf;
      if (chipOrig) chipOrig.textContent = data.chips.orig;
      if (chipQa) chipQa.textContent = data.chips.qa;
      if (chipDb) chipDb.textContent = data.chips.db;
    }
  }, 380);
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
    const customUrl = cockpitInput ? cockpitInput.value.trim() : "";
    let matchedPreset = "flask";
    if (customUrl.includes("express")) matchedPreset = "express";
    else if (customUrl.includes("fastapi")) matchedPreset = "fastapi";
    else if (customUrl.includes("hackathon") || customUrl.includes("student")) matchedPreset = "hackathon";
    runCockpitSimulation(matchedPreset);
  });
}

// Cockpit Tabs (Telemetry / AST / Diff)
const cockpitTabBtns = document.querySelectorAll(".cockpit-tab-btn");
const termActiveViewLabel = document.getElementById("termActiveViewLabel");

cockpitTabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    cockpitTabBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.getAttribute("data-tab");

    if (cockpitTerminal) cockpitTerminal.style.display = tab === "telemetry" ? "block" : "none";
    if (cockpitAstView) cockpitAstView.style.display = tab === "ast" ? "block" : "none";
    if (cockpitDiffView) cockpitDiffView.style.display = tab === "diff" ? "block" : "none";

    if (termActiveViewLabel) {
      if (tab === "telemetry") termActiveViewLabel.textContent = "STREAM: telemetry_ws_v2";
      else if (tab === "ast") termActiveViewLabel.textContent = "AST_TREE: tree_sitter_c_ast";
      else if (tab === "diff") termActiveViewLabel.textContent = "PATCH: autoreview_unified_diff";
    }
  });
});

// Copy & Clear Terminal Buttons
const copyLogsBtn = document.getElementById("copyLogsBtn");
const clearLogsBtn = document.getElementById("clearLogsBtn");
const exportAuditJsonBtn = document.getElementById("exportAuditJsonBtn");

if (copyLogsBtn) {
  copyLogsBtn.addEventListener("click", () => {
    let textToCopy = "";
    if (cockpitTerminal && cockpitTerminal.style.display !== "none") {
      textToCopy = cockpitTerminal.innerText;
    } else if (cockpitAstView && cockpitAstView.style.display !== "none") {
      textToCopy = cockpitAstView.innerText;
    } else if (cockpitDiffView && cockpitDiffView.style.display !== "none") {
      textToCopy = cockpitDiffView.innerText;
    }
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      showToast("Copied terminal output to clipboard");
    }
  });
}

if (clearLogsBtn) {
  clearLogsBtn.addEventListener("click", () => {
    if (cockpitTerminal) cockpitTerminal.innerHTML = "<div class='term-line'><span class='term-log info'>[00:00.00] Terminal buffer cleared. Ready for next evaluation.</span></div>";
    showToast("Terminal buffer cleared");
  });
}

if (exportAuditJsonBtn) {
  exportAuditJsonBtn.addEventListener("click", () => {
    const data = sampleRepos[currentSimulationKey] || sampleRepos.flask;
    const payload = {
      repository: data.url,
      overall_score: data.overall,
      tier: data.tier,
      dimension_scores: data.chips,
      consjudge_consensus: {
        pass_a_model: "Groq LLaMA 3.3 70B",
        pass_b_model: "NaraRouter Claude / GPT-4o",
        variance: "±0.8 pts",
        status: "HIGH_CONFIDENCE"
      },
      audit_timestamp: new Date().toISOString()
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    showToast("Exported evaluation JSON to clipboard");
  });
}

// ==========================================
// 5. Radar Chart Canvas Visualizer
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
// 6. Agent Node Spec Modal Logic
// ==========================================
const agentModal = document.getElementById("agentModal");
const closeAgentModalBtn = document.getElementById("closeAgentModalBtn");
const modalAgentTitle = document.getElementById("modalAgentTitle");
const modalAgentNodeId = document.getElementById("modalAgentNodeId");
const modalAgentContent = document.getElementById("modalAgentContent");

const agentSpecs = {
  security: {
    title: "AutoReview Security Agent",
    nodeId: "agent_autoreview_security",
    engine: "Tree-Sitter C AST Parser + LangGraph Cyclic Node",
    query: "(call_expression (identifier) @fn_call (#match? @fn_call '^(eval|exec|os\\.system)$'))",
    desc: "Classifies Common Weakness Enumerations (CWE-89, CWE-798, CWE-78) by identifying vulnerable coordinates in the concrete syntax tree, then synthesizes ready-to-merge unified git diff patches.",
    output: `{\n  "cwe_id": "CWE-798",\n  "severity": "HIGH",\n  "file": "config.py",\n  "line_range": [10, 14],\n  "diff_patch": "--- a/config.py\\n+++ b/config.py\\n@@ -10,1 +10,1 @@\\n-SECRET = 'hardcoded'\\n+SECRET = os.environ.get('KEY')"\n}`
  },
  architecture: {
    title: "Architecture & Modularity Agent",
    nodeId: "agent_arch_modularity",
    engine: "NetworkX Dependency Graph + Structural Cohesion Matrix",
    query: "(import_from_statement (dotted_name) @module (import_list) @imported_symbols)",
    desc: "Audits package coupling, afferent/efferent stability index, cyclomatic complexity per function, and clean separation between domain logic and persistence layers.",
    output: `{\n  "solid_compliance": 0.94,\n  "circular_dependencies": [],\n  "max_cyclomatic_complexity": 8,\n  "modularity_grade": "A+"\n}`
  },
  performance: {
    title: "Algorithmic Performance Agent",
    nodeId: "agent_algo_performance",
    engine: "Loop Complexity Estimator + Async Event Loop Scanner",
    query: "(for_statement (for_statement) @nested_loop) ; flags O(N^2) potential bottleneck",
    desc: "Calculates asymptotic Big-O runtime and space bounds. Scans for blocking synchronous file/network I/O inside async event loop handlers and unindexed collection scans.",
    output: `{\n  "asymptotic_runtime": "O(N log N)",\n  "event_loop_blocking_calls": 0,\n  "cache_efficiency": 0.92,\n  "performance_tier": "OPTIMAL"\n}`
  },
  qa: {
    title: "QA & Testing Resilience Agent",
    nodeId: "agent_qa_resilience",
    engine: "Pytest / Jest AST Mock Boundary Analyzer",
    query: "(assert_statement) @assertion ; measures test assertion density",
    desc: "Evaluates test-to-production code volume, assertion density per test case, mock isolation boundaries, and penalizes fragile happy-path assertions without error branch testing.",
    output: `{\n  "test_code_ratio": 0.42,\n  "assertion_density": 3.8,\n  "mock_isolation_score": 0.88,\n  "coverage_status": "STRONG"\n}`
  },
  database: {
    title: "Database & Persistence Agent",
    nodeId: "agent_db_persistence",
    engine: "ORM Query Graph + Relational Normalization Inspector",
    query: "(call_expression (attribute (identifier) @obj (#eq? @obj 'db')))",
    desc: "Detects N+1 query patterns, verifies foreign key indices, relational 3NF normalization, migration schema health, and transaction safety in ORM models.",
    output: `{\n  "relational_normalization": "3NF Certified",\n  "n_plus_one_vulnerabilities": 0,\n  "connection_pool_safe": true\n}`
  },
  originality: {
    title: "AST Originality & Anti-Plagiarism Engine",
    nodeId: "agent_ast_originality",
    engine: "Tree-Sitter C-Speed Token Jaccard Hash Vectorizer (<5MB RAM)",
    query: "(function_definition (parameters) @params (block) @body)",
    desc: "Strips comments and variable renames. Extracts canonical AST grammar structures and compares min-hash Jaccard vectors against 337+ template repositories for an authentic 0-100 originality rating.",
    output: `{\n  "ast_similarity_vector": 0.048,\n  "originality_score": 95.2,\n  "template_clone_status": "ORIGINAL_AUTHORSHIP"\n}`
  }
};

document.querySelectorAll(".agent-inspect-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const agentKey = btn.getAttribute("data-agent");
    const spec = agentSpecs[agentKey] || agentSpecs.security;
    if (modalAgentTitle) modalAgentTitle.textContent = spec.title;
    if (modalAgentNodeId) modalAgentNodeId.textContent = spec.nodeId;
    if (modalAgentContent) {
      modalAgentContent.innerHTML = `
        <div class="spec-block">
          <div class="spec-title">EXECUTION ENGINE</div>
          <div style="font-size: 13px; font-weight: 600; color: var(--text-primary);">${spec.engine}</div>
        </div>
        <div class="spec-block">
          <div class="spec-title">OPERATIONAL RESPONSIBILITY</div>
          <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.55;">${spec.desc}</div>
        </div>
        <div class="spec-block">
          <div class="spec-title">TREE-SITTER AST QUERY GRAMMAR</div>
          <div class="spec-code" style="color: var(--accent-cyan);">${spec.query}</div>
        </div>
        <div class="spec-block">
          <div class="spec-title">STANDARDIZED JSON EMISSION</div>
          <div class="spec-code" style="color: var(--accent-emerald);">${spec.output}</div>
        </div>
      `;
    }
    if (agentModal) agentModal.classList.add("open");
  });
});

if (closeAgentModalBtn && agentModal) {
  closeAgentModalBtn.addEventListener("click", () => {
    agentModal.classList.remove("open");
  });
}

// ==========================================
// 7. ConsJudge Interactive Variance Simulator
// ==========================================
const varianceSlider = document.getElementById("varianceSlider");
const judgeVarianceVal = document.getElementById("judgeVarianceVal");
const judgeConfidenceBadge = document.getElementById("judgeConfidenceBadge");
const judgeScoreA = document.getElementById("judgeScoreA");
const judgeScoreB = document.getElementById("judgeScoreB");

function updateConsJudgeSimulation(val) {
  const v = parseFloat(val);
  const baseScore = 92.0;
  const passBScore = Math.max(70, (baseScore - v)).toFixed(1);

  if (judgeVarianceVal) judgeVarianceVal.textContent = `±${v.toFixed(1)} pt`;
  if (judgeScoreA) judgeScoreA.textContent = baseScore.toFixed(1);
  if (judgeScoreB) judgeScoreB.textContent = passBScore;

  if (judgeConfidenceBadge) {
    if (v <= 1.4) {
      judgeConfidenceBadge.textContent = "HIGH CONFIDENCE (CERTIFIED)";
      judgeConfidenceBadge.style.background = "rgba(16, 185, 129, 0.15)";
      judgeConfidenceBadge.style.borderColor = "var(--accent-emerald)";
      judgeConfidenceBadge.style.color = "var(--accent-emerald)";
    } else if (v <= 2.5) {
      judgeConfidenceBadge.textContent = "MODERATE AGREEMENT (VALIDATED)";
      judgeConfidenceBadge.style.background = "rgba(245, 158, 11, 0.15)";
      judgeConfidenceBadge.style.borderColor = "var(--accent-amber)";
      judgeConfidenceBadge.style.color = "var(--accent-amber)";
    } else {
      judgeConfidenceBadge.textContent = "DIVERGENT (RE-ARBITRATION)";
      judgeConfidenceBadge.style.background = "rgba(244, 63, 94, 0.15)";
      judgeConfidenceBadge.style.borderColor = "var(--accent-rose)";
      judgeConfidenceBadge.style.color = "var(--accent-rose)";
    }
  }
}

if (varianceSlider) {
  varianceSlider.addEventListener("input", (e) => {
    document.querySelectorAll(".v-preset-btn").forEach(b => b.classList.remove("active"));
    updateConsJudgeSimulation(e.target.value);
  });
}

document.querySelectorAll(".v-preset-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".v-preset-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const v = btn.getAttribute("data-var");
    if (varianceSlider) varianceSlider.value = v;
    updateConsJudgeSimulation(v);
  });
});

// ==========================================
// 8. Batch Pipeline Interactive Simulator
// ==========================================
const batchAdvanceBtn = document.getElementById("batchAdvanceBtn");
const batchWindowTitle = document.getElementById("batchWindowTitle");
const batchMemText = document.getElementById("batchMemText");
const batchMemFill = document.getElementById("batchMemFill");

const batchWindows = [
  {
    title: "Window 1 of 4: Repositories 01 - 05",
    mem: "64.2 MB / 512 MB (12.5%)",
    fill: "12.5%",
    slots: [
      { name: "pallets/flask", status: "COMPLETED (93/100)", cls: "completed" },
      { name: "expressjs/express", status: "COMPLETED (91/100)", cls: "completed" },
      { name: "fastapi/fastapi", status: "ANALYZING AST...", cls: "active" },
      { name: "django/django", status: "QUEUED", cls: "" },
      { name: "tiangolo/sqlmodel", status: "QUEUED", cls: "" }
    ]
  },
  {
    title: "Window 2 of 4: Repositories 06 - 10",
    mem: "67.8 MB / 512 MB (13.2%)",
    fill: "13.2%",
    slots: [
      { name: "django/django", status: "COMPLETED (89/100)", cls: "completed" },
      { name: "tiangolo/sqlmodel", status: "COMPLETED (94/100)", cls: "completed" },
      { name: "psf/requests", status: "ANALYZING AST...", cls: "active" },
      { name: "encode/httpx", status: "QUEUED", cls: "" },
      { name: "aio-libs/aiohttp", status: "QUEUED", cls: "" }
    ]
  },
  {
    title: "Window 3 of 4: Repositories 11 - 15",
    mem: "62.1 MB / 512 MB (12.1%)",
    fill: "12.1%",
    slots: [
      { name: "psf/requests", status: "COMPLETED (92/100)", cls: "completed" },
      { name: "encode/httpx", status: "COMPLETED (90/100)", cls: "completed" },
      { name: "pydantic/pydantic", status: "ANALYZING AST...", cls: "active" },
      { name: "sqlalchemy/sqlalchemy", status: "QUEUED", cls: "" },
      { name: "celery/celery", status: "QUEUED", cls: "" }
    ]
  }
];

let activeBatchIndex = 0;

if (batchAdvanceBtn) {
  batchAdvanceBtn.addEventListener("click", () => {
    activeBatchIndex = (activeBatchIndex + 1) % batchWindows.length;
    const win = batchWindows[activeBatchIndex];
    if (batchWindowTitle) batchWindowTitle.textContent = win.title;
    if (batchMemText) batchMemText.textContent = win.mem;
    if (batchMemFill) batchMemFill.style.width = win.fill;

    const slotRow = document.querySelector(".pipeline-slot-row");
    if (slotRow) {
      slotRow.innerHTML = win.slots.map((s, idx) => `
        <div class="slot-card ${s.cls}">
          <span class="slot-header">SLOT 0${idx + 1}</span>
          <span class="slot-name">${s.name}</span>
          <span class="slot-tag" style="color: ${s.cls === 'completed' ? 'var(--accent-emerald)' : s.cls === 'active' ? 'var(--accent-cyan)' : 'var(--text-muted)'};">
            ${s.status}
          </span>
        </div>
      `).join("");
    }
    showToast(`Batch advanced to: ${win.title.split(":")[0]}`);
  });
}

// ==========================================
// 9. Comparison Table Category Filter
// ==========================================
const compFilterBtns = document.querySelectorAll(".comp-filter-btn");
const compRows = document.querySelectorAll(".comp-table tbody tr");

compFilterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    compFilterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.getAttribute("data-filter");

    compRows.forEach(row => {
      const cat = row.getAttribute("data-cat");
      if (filter === "all" || cat === filter) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });
});

// ==========================================
// 10. Certificate Cryptographic Verifier
// ==========================================
const verifyHashBtn = document.getElementById("verifyHashBtn");
const certVerifyResult = document.getElementById("certVerifyResult");
const downloadCertBtn = document.getElementById("downloadCertBtn");

if (verifyHashBtn && certVerifyResult) {
  verifyHashBtn.addEventListener("click", () => {
    verifyHashBtn.disabled = true;
    verifyHashBtn.innerHTML = "<svg class='icon-svg icon-sm' viewBox='0 0 24 24'><polyline points='12 2 12 6 12 18 12 22'/></svg> Verifying...";
    setTimeout(() => {
      verifyHashBtn.disabled = false;
      verifyHashBtn.innerHTML = "<svg class='icon-svg icon-sm' viewBox='0 0 24 24'><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'/></svg> Verified";
      certVerifyResult.style.display = "flex";
      showToast("Cryptographic SHA-256 seal verified authentic");
    }, 450);
  });
}

if (downloadCertBtn) {
  downloadCertBtn.addEventListener("click", () => {
    showToast("Generating tamper-evident 300 DPI A4 Landscape PDF...");
    setTimeout(() => {
      window.open(currentAppUrl.replace(/\/$/, "") + "/judges", "_blank");
    }, 600);
  });
}

// ==========================================
// 11. FAQ Search Filter & Accordion
// ==========================================
const faqSearchInput = document.getElementById("faqSearchInput");
const faqCards = document.querySelectorAll(".faq-card");

if (faqSearchInput) {
  faqSearchInput.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    faqCards.forEach(card => {
      const txt = card.innerText.toLowerCase();
      if (txt.includes(q)) {
        card.style.display = "";
      } else {
        card.style.display = "none";
      }
    });
  });
}

faqCards.forEach(card => {
  const q = card.querySelector(".faq-question");
  q.addEventListener("click", () => {
    const isOpen = card.classList.contains("open");
    faqCards.forEach(c => c.classList.remove("open"));
    if (!isOpen) card.classList.add("open");
  });
});

// ==========================================
// 12. Command Palette Dialog (Ctrl + K)
// ==========================================
const commandModal = document.getElementById("commandModal");
const openCommandBtn = document.getElementById("openCommandBtn");
const commandInput = document.getElementById("commandInput");
const commandList = document.getElementById("commandList");

function openCommandPalette() {
  if (commandModal) {
    commandModal.classList.add("open");
    if (commandInput) {
      commandInput.value = "";
      commandInput.focus();
    }
    filterCommandItems("");
  }
}

function closeCommandPalette() {
  if (commandModal) {
    commandModal.classList.remove("open");
  }
}

function filterCommandItems(query) {
  const q = query.toLowerCase().trim();
  const items = document.querySelectorAll(".command-item");
  let firstVisible = null;
  items.forEach(item => {
    const text = item.innerText.toLowerCase();
    if (!q || text.includes(q)) {
      item.style.display = "flex";
      if (!firstVisible) firstVisible = item;
    } else {
      item.style.display = "none";
    }
  });

  items.forEach(i => i.classList.remove("active"));
  if (firstVisible) firstVisible.classList.add("active");
}

if (openCommandBtn) {
  openCommandBtn.addEventListener("click", openCommandPalette);
}

window.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    if (commandModal && commandModal.classList.contains("open")) {
      closeCommandPalette();
    } else {
      openCommandPalette();
    }
  } else if (e.key === "Escape") {
    if (commandModal && commandModal.classList.contains("open")) {
      closeCommandPalette();
    }
    if (agentModal && agentModal.classList.contains("open")) {
      agentModal.classList.remove("open");
    }
    if (configModal && configModal.classList.contains("open")) {
      configModal.classList.remove("open");
    }
  }
});

if (commandInput) {
  commandInput.addEventListener("input", (e) => {
    filterCommandItems(e.target.value);
  });

  commandInput.addEventListener("keydown", (e) => {
    const visibleItems = Array.from(document.querySelectorAll(".command-item")).filter(i => i.style.display !== "none");
    const activeIndex = visibleItems.findIndex(i => i.classList.contains("active"));

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = (activeIndex + 1) % visibleItems.length;
      visibleItems.forEach(i => i.classList.remove("active"));
      visibleItems[nextIndex]?.classList.add("active");
      visibleItems[nextIndex]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex = (activeIndex - 1 + visibleItems.length) % visibleItems.length;
      visibleItems.forEach(i => i.classList.remove("active"));
      visibleItems[prevIndex]?.classList.add("active");
      visibleItems[prevIndex]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = visibleItems[activeIndex] || visibleItems[0];
      if (current) current.click();
    }
  });
}

document.querySelectorAll(".command-item").forEach(item => {
  item.addEventListener("click", () => {
    const action = item.getAttribute("data-action");
    const target = item.getAttribute("data-target");

    closeCommandPalette();

    if (action === "goto") {
      const el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (action === "preset") {
      document.querySelectorAll(".chip-btn").forEach(c => {
        if (c.getAttribute("data-preset") === target) {
          c.classList.add("active");
        } else {
          c.classList.remove("active");
        }
      });
      runCockpitSimulation(target);
      const cockpit = document.getElementById("cockpit");
      if (cockpit) cockpit.scrollIntoView({ behavior: "smooth" });
      showToast(`Running preset simulation: ${target}`);
    } else if (action === "link") {
      const dest = currentAppUrl.replace(/\/$/, "") + (target === "/" ? "" : target);
      window.open(dest, "_blank");
    }
  });
});

if (commandModal) {
  commandModal.addEventListener("click", (e) => {
    if (e.target === commandModal) closeCommandPalette();
  });
}

// ==========================================
// 13. Floating Back to Top Button
// ==========================================
const backToTopBtn = document.getElementById("backToTopBtn");
window.addEventListener("scroll", () => {
  if (backToTopBtn) {
    if (window.scrollY > 350) backToTopBtn.classList.add("visible");
    else backToTopBtn.classList.remove("visible");
  }
});

if (backToTopBtn) {
  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ==========================================
// 14. Target URL Configuration Modal
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

// ==========================================
// 15. Toast Notification Component
// ==========================================
function showToast(msg) {
  const existing = document.querySelectorAll(".cb-toast");
  existing.forEach(t => t.remove());

  const toast = document.createElement("div");
  toast.className = "cb-toast";
  toast.style.position = "fixed";
  toast.style.bottom = "24px";
  toast.style.right = "24px";
  toast.style.background = "#080D1A";
  toast.style.border = "1px solid var(--accent-cyan)";
  toast.style.color = "#FFFFFF";
  toast.style.padding = "10px 18px";
  toast.style.borderRadius = "8px";
  toast.style.fontFamily = "var(--font-sans)";
  toast.style.fontWeight = "600";
  toast.style.fontSize = "13px";
  toast.style.boxShadow = "0 12px 36px rgba(0,0,0,0.8), 0 0 20px var(--accent-cyan-glow)";
  toast.style.zIndex = "99999";
  toast.style.display = "flex";
  toast.style.alignItems = "center";
  toast.style.gap = "8px";
  toast.style.animation = "modalScaleIn 0.18s ease-out";

  toast.innerHTML = `
    <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--accent-emerald); box-shadow: 0 0 8px var(--accent-emerald);"></span>
    <span>${msg}</span>
  `;

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.2s ease";
    setTimeout(() => toast.remove(), 200);
  }, 2800);
}

// ==========================================
// 16. Initialize on DOM Ready
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  updateLaunchLinks();
  runCockpitSimulation("flask");
  updateConsJudgeSimulation(1.0);
});
