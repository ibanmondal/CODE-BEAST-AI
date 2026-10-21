"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  Terminal as TerminalIcon, 
  ShieldCheck, 
  AlertTriangle, 
  Play, 
  RotateCcw, 
  Lock, 
  Unlock, 
  Cpu, 
  Bug, 
  Flame, 
  ExternalLink, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  FileCode, 
  Activity, 
  Layers, 
  Server, 
  Radio, 
  Check, 
  Copy, 
  ChevronRight, 
  RefreshCw,
  Shield,
  Download,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { CodeBeastLiquidButton } from '@/components/ui/codebeast-liquid-button';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/ui/motion-primitives';

export interface ThreatVector {
  id: string;
  name: string;
  cwe: string;
  severity: 'Critical' | 'High' | 'Medium';
  cvss: number;
  category: string;
  targetEndpoint: string;
  targetMethod: 'GET' | 'POST' | 'PUT' | 'DELETE';
  targetFile: string;
  vulnerableLine: number;
  description: string;
  payload: string;
  impactSummary: string;
  confidentialityImpact: number; // 0-100
  integrityImpact: number;       // 0-100
  availabilityImpact: number;    // 0-100
  vulnerableCode: string;
  securePatchCode: string;
  patchExplanation: string;
  simulatedLogsUnshielded: string[];
  simulatedLogsShielded: string[];
}

const THREAT_VECTORS: ThreatVector[] = [
  {
    id: "sqli",
    name: "Blind SQL Injection & Database Exfiltration",
    cwe: "CWE-89",
    severity: "Critical",
    cvss: 9.8,
    category: "Injection & Persistence",
    targetEndpoint: "/api/v1/users/profile?id=1",
    targetMethod: "GET",
    targetFile: "backend/app/controllers/user_controller.py",
    vulnerableLine: 42,
    description: "Raw string interpolation in SQL query permits unauthenticated attackers to append Boolean logic and UNION operators, exfiltrating the entire credential table.",
    payload: "1' UNION SELECT id, username, password_hash, jwt_secret FROM admin_users WHERE '1'='1",
    impactSummary: "Complete extraction of salted password hashes and active JWT secrets allowing full account takeover.",
    confidentialityImpact: 100,
    integrityImpact: 90,
    availabilityImpact: 60,
    vulnerableCode: `# VULNERABLE: Direct string formatting into raw SQL cursor
cursor.execute(
    f"SELECT id, username, email FROM users WHERE id = '{user_id}'"
)
user_data = cursor.fetchone()`,
    securePatchCode: `# SECURE: Parameterized Prepared Statement with Type Coercion
query = "SELECT id, username, email FROM users WHERE id = :user_id"
cursor.execute(query, {"user_id": int(user_id)})
user_data = cursor.fetchone()`,
    patchExplanation: "Replaces raw f-string injection with parameterized prepared statement, enforcing strict integer coercion at the controller boundary.",
    simulatedLogsUnshielded: [
      "[*] Initiating HTTP GET probe to /api/v1/users/profile?id=1",
      "[+] Target responded with 200 OK. Testing SQL syntax injection...",
      "[!] Injected payload: 1' UNION SELECT id, username, password_hash FROM admin_users --",
      "[!] Database syntax parser accepted concatenated UNION query.",
      "[+] DB Response Payload parsed: 14 rows returned in 12.4ms.",
      "[!] CRITICAL: Extracted admin password hash: $2b$12$e8xL... (admin@codebeast.ai)",
      "[!] CRITICAL: Extracted JWT signing secret: hs256_master_key_99x",
      "[!!!] ATTACK SUCCESSFUL: Unauthorized database exfiltration confirmed!"
    ],
    simulatedLogsShielded: [
      "[*] Initiating HTTP GET probe to /api/v1/users/profile?id=1",
      "[+] Target protected by Code Beast Zero-Trust Shield & WAF Kernel.",
      "[!] Injected payload: 1' UNION SELECT id, username, password_hash FROM admin_users --",
      "[-] Zero-Trust Filter: Parameterized query coercion detected SQL meta-characters.",
      "[-] Input Sanitizer dropped query string: Quote mismatch & UNION keyword blocked.",
      "[-] Target Gateway returned: 400 Bad Request (Invalid Parameter Format)",
      "[+] DB connection preserved. 0 records accessed.",
      "[✓] ATTACK BLOCKED: Zero-Trust defense successfully neutralized SQLi vector."
    ]
  },
  {
    id: "jwt_none",
    name: "JWT Algorithm 'None' Signature Authentication Bypass",
    cwe: "CWE-287",
    severity: "Critical",
    cvss: 9.1,
    category: "Broken Authentication",
    targetEndpoint: "/api/v1/auth/admin/console",
    targetMethod: "POST",
    targetFile: "backend/app/middleware/auth_jwt.py",
    vulnerableLine: 68,
    description: "JWT verification library allows tokens with algorithm header set to 'none', bypassing cryptographic signature validation entirely and granting superuser roles.",
    payload: `Header: {"alg": "none", "typ": "JWT"}\nPayload: {"sub": "root", "role": "superuser", "exp": 1893456000}`,
    impactSummary: "Privilege escalation to Superuser without possessing the private HMAC signing key.",
    confidentialityImpact: 95,
    integrityImpact: 100,
    availabilityImpact: 75,
    vulnerableCode: `# VULNERABLE: Signature verification disabled if alg is 'none'
token = request.headers.get("Authorization").split(" ")[1]
decoded = jwt.decode(token, verify=False)  # Flaw: skips crypto check
if decoded.get("role") == "superuser":
    grant_admin_access()`,
    securePatchCode: `# SECURE: Enforce asymmetric verification with strict algorithm whitelist
token = request.headers.get("Authorization").split(" ")[1]
decoded = jwt.decode(
    token, 
    key=PUBLIC_SIGNING_KEY, 
    algorithms=["RS256"], 
    options={"require": ["exp", "sub", "role"]}
)`,
    patchExplanation: "Explicitly whitelists asymmetric 'RS256' algorithm and enforces strict cryptographic verification of signatures before evaluating claims.",
    simulatedLogsUnshielded: [
      "[*] Crafting forged JWT token with header: {'alg': 'none', 'typ': 'JWT'}",
      "[*] Injected claims: {'sub': 'hacker', 'role': 'superuser', 'is_admin': true}",
      "[+] Dispatching POST /api/v1/auth/admin/console with forged Bearer token...",
      "[!] Target Auth Middleware failed to reject unsigned 'none' algorithm token.",
      "[!] Session Context upgraded to: SUPERUSER_ROOT_ROLE",
      "[+] Response Code: 200 OK (Administrative privileges granted).",
      "[!!!] ATTACK SUCCESSFUL: Full identity takeover achieved without secret key!"
    ],
    simulatedLogsShielded: [
      "[*] Crafting forged JWT token with header: {'alg': 'none', 'typ': 'JWT'}",
      "[+] Target protected by Code Beast Zero-Trust Shield & Cryptographic Kernel.",
      "[+] Dispatching POST /api/v1/auth/admin/console with forged Bearer token...",
      "[-] Zero-Trust Middleware: Algorithm 'none' is explicitly prohibited by policy.",
      "[-] Signature validation error: Token missing mandatory RS256 signature bytes.",
      "[-] Response Code: 401 Unauthorized (Invalid Cryptographic Signature)",
      "[✓] ATTACK BLOCKED: Forged token rejected. Zero privilege escalation."
    ]
  },
  {
    id: "redis_dos",
    name: "Unbounded Connection Starvation & Denial of Service",
    cwe: "CWE-400",
    severity: "High",
    cvss: 7.5,
    category: "Resource Management",
    targetEndpoint: "/api/v1/cache/burst-query",
    targetMethod: "POST",
    targetFile: "backend/app/services/cache_service.py",
    vulnerableLine: 112,
    description: "Spawning new Redis connection clients per request without pooling or concurrency semaphores exhausts server file descriptors, causing 504 timeouts.",
    payload: "Concurrent asynchronous burst of 5,000 TCP handshakes in 800ms",
    impactSummary: "Complete service outage for all legitimate users as backend socket pools and CPU memory become exhausted.",
    confidentialityImpact: 10,
    integrityImpact: 20,
    availabilityImpact: 100,
    vulnerableCode: `# VULNERABLE: Direct connection creation per incoming request
async def fetch_cache(key: str):
    # Unbounded client generation exhausts socket file descriptors
    client = redis.Redis(host="localhost", port=6379)
    return await client.get(key)`,
    securePatchCode: `# SECURE: Thread-safe Async Connection Pool with Token-Bucket Rate Limiter
redis_pool = ConnectionPool.from_url("redis://localhost:6379", max_connections=50)

@limiter.limit("50/second")
async def fetch_cache(key: str):
    async with Redis(connection_pool=redis_pool) as client:
        return await client.get(key)`,
    patchExplanation: "Implements static max connection pooling capped at 50 connections with token-bucket rate limiting to eliminate socket starvation.",
    simulatedLogsUnshielded: [
      "[*] Generating concurrent burst: 5,000 asynchronous HTTP connections...",
      "[+] Socket spawn rate: 6,250 requests/sec dispatched.",
      "[!] Server TCP connection counter reached 1,024 (OS limit).",
      "[!] Errno 24: Too many open files encountered in cache_service.py.",
      "[!] CPU worker memory spiked from 14% to 98.4%. Event loop blocked.",
      "[!] Target Gateway latency collapsed: 12,400ms -> 504 Gateway Timeout.",
      "[!!!] ATTACK SUCCESSFUL: Denial of Service verified. Microservice unresponsive!"
    ],
    simulatedLogsShielded: [
      "[*] Generating concurrent burst: 5,000 asynchronous HTTP connections...",
      "[+] Target protected by Code Beast Zero-Trust Shield & Rate Limiter.",
      "[-] Connection Pool Semaphore: active clients constrained to 50 max.",
      "[-] Token-Bucket Rate Limiter: Dropped 4,950 excess requests with 429 Too Many Requests.",
      "[-] System health metrics: CPU 18.2%, Memory 165MB (Stable).",
      "[+] Legitimate requests served within 3.4ms latency SLA.",
      "[✓] ATTACK BLOCKED: DoS storm mitigated by connection pooling and rate limiting."
    ]
  },
  {
    id: "secret_leak",
    name: "Hardcoded Cloud Infrastructure Secrets in Git Tree",
    cwe: "CWE-798",
    severity: "High",
    cvss: 8.6,
    category: "Credential Exposure",
    targetEndpoint: "git://github.com/repo/config/env.production.ts",
    targetMethod: "GET",
    targetFile: "config/env.production.ts",
    vulnerableLine: 18,
    description: "Static credentials for Groq API, AWS S3 Buckets, and PostgreSQL production instance committed directly into public repository tree.",
    payload: "Tree-sitter entropy scanner targeting regex: (AWS_SECRET|GROQ_API_KEY|POSTGRES_PWD)=['\"][A-Za-z0-9_-]{20,}['\"]",
    impactSummary: "Direct unauthorized access to production cloud infrastructure and third-party AI LLM inference quotas.",
    confidentialityImpact: 100,
    integrityImpact: 85,
    availabilityImpact: 70,
    vulnerableCode: `# VULNERABLE: Production secrets committed to version control
GROQ_API_KEY = "gsk_99a8x7b6c5d4e3f2a1_live_production_key"
AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
DATABASE_URL = "postgres://admin:MasterPass99@db.prod.internal:5432/core"`,
    securePatchCode: `# SECURE: Environment Variable Ingestion with Secret Vault Injection
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str = os.environ["GROQ_API_KEY"]
    DATABASE_URL: str = os.environ["DATABASE_URL"]
    
settings = Settings()`,
    patchExplanation: "Pulls all sensitive credentials from encrypted system environment variables and HashiCorp Vault with zero secrets in code.",
    simulatedLogsUnshielded: [
      "[*] Running high-entropy string scanner across repository commit history...",
      "[+] Scanning commit 8a9f2bc (Initial production deploy setup)...",
      "[!] HIGH ENTROPY DETECTED in config/env.production.ts:L18",
      "[!] Identified Groq API Key: gsk_99a8... (Valid Live Quota: 100,000 req/day)",
      "[!] Identified AWS S3 Key: wJalrX... (Bucket: codebeast-production-backups)",
      "[!] Identified PostgreSQL URI: postgres://admin:***@db.prod.internal",
      "[!!!] ATTACK SUCCESSFUL: Production cloud keys compromised from git tree!"
    ],
    simulatedLogsShielded: [
      "[*] Running high-entropy string scanner across repository commit history...",
      "[+] Target protected by Code Beast Zero-Trust Pre-Commit Guard.",
      "[-] Git tree verified clean: Zero raw API keys or hardcoded passwords found.",
      "[-] Configuration verified using Pydantic BaseSettings & Vault secrets.",
      "[+] Entropy scan passed with 0 sensitive token exposures.",
      "[✓] ATTACK BLOCKED: Zero credentials exposed in static source code."
    ]
  },
  {
    id: "idor",
    name: "Insecure Direct Object Reference (IDOR) Exfiltration",
    cwe: "CWE-639",
    severity: "High",
    cvss: 8.2,
    category: "Access Control",
    targetEndpoint: "/api/v1/reports/download?report_id=rep_99182",
    targetMethod: "GET",
    targetFile: "backend/app/controllers/report_controller.py",
    vulnerableLine: 84,
    description: "Report retrieval controller queries records strictly by sequential primary key without validating that the authenticated session owns the requested resource.",
    payload: "Iterative fuzzing: GET /api/v1/reports/download?report_id=rep_{1000..9999}",
    impactSummary: "Cross-tenant data leakage exposing private audit evaluations and intellectual property of other organizations.",
    confidentialityImpact: 90,
    integrityImpact: 50,
    availabilityImpact: 10,
    vulnerableCode: `# VULNERABLE: Direct lookup without tenant ownership verification
@router.get("/reports/download")
async def get_report(report_id: str, current_user = Depends(get_user)):
    # Flaw: Fetches any report regardless of current_user.tenant_id
    report = db.query(Report).filter(Report.id == report_id).first()
    return report`,
    securePatchCode: `# SECURE: Enforce Multi-Tenant Scoped Ownership Constraint
@router.get("/reports/download")
async def get_report(report_id: str, current_user = Depends(get_user)):
    report = db.query(Report).filter(
        Report.id == report_id,
        Report.tenant_id == current_user.tenant_id  # Enforce boundary
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Resource not found")
    return report`,
    patchExplanation: "Enforces strict tenant boundary constraint in query filter so users can never query objects belonging to other organizations.",
    simulatedLogsUnshielded: [
      "[*] Attacker authenticated as low-privileged user (tenant_id: 402)",
      "[*] Probing report endpoint with sequential IDs: rep_99181, rep_99182, rep_99183...",
      "[+] Request dispatched: GET /api/v1/reports/download?report_id=rep_99182",
      "[!] Backend returned 200 OK. Report belonged to foreign tenant: 108 (Enterprise Corp).",
      "[!] Extracted confidential architecture vulnerability audit report #99182.",
      "[!] Replaying fuzzing loop: Successfully harvested 24 private reports.",
      "[!!!] ATTACK SUCCESSFUL: Cross-tenant data exfiltrated via IDOR flaw!"
    ],
    simulatedLogsShielded: [
      "[*] Attacker authenticated as low-privileged user (tenant_id: 402)",
      "[*] Probing report endpoint with sequential IDs: rep_99181, rep_99182...",
      "[+] Target protected by Code Beast Multi-Tenant Scoped Filter.",
      "[-] Tenant verification failed: report.tenant_id (108) != session.tenant_id (402).",
      "[-] Target Gateway returned: 404 Not Found (Access Denied & Audited).",
      "[-] Security Event logged: Unauthorized IDOR probe attempt flagged.",
      "[✓] ATTACK BLOCKED: Multi-tenant boundary successfully isolated the object."
    ]
  }
];

export default function ThreatSandboxPage() {
  const [selectedVectorId, setSelectedVectorId] = useState<string>("sqli");
  const [isShieldActive, setIsShieldActive] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [activeCodeTab, setActiveCodeTab] = useState<'vulnerable' | 'patched' | 'diff'>('vulnerable');
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [targetRepo, setTargetRepo] = useState<string>("ibanmondal/CODE-BEAST-AI");

  const terminalEndRef = useRef<HTMLDivElement>(null);

  const currentVector = useMemo(() => {
    return THREAT_VECTORS.find(v => v.id === selectedVectorId) || THREAT_VECTORS[0];
  }, [selectedVectorId]);

  // Load initial logs on vector change
  useEffect(() => {
    setTerminalLogs([
      `[root@codebeast-sandbox:~# ready] Target: ${targetRepo}`,
      `[*] Loaded exploit vector: ${currentVector.name} (${currentVector.cwe})`,
      `[*] Target Endpoint: ${currentVector.targetMethod} ${currentVector.targetEndpoint}`,
      `[*] Shield Status: ${isShieldActive ? "ACTIVE (Zero-Trust Protected)" : "DISABLED (Vulnerable)"}`,
      `[+] Click 'Launch Exploit Simulation' to execute payload in live sandbox.`
    ]);
  }, [selectedVectorId, isShieldActive, targetRepo]);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  // Simulate Attack Execution with typing delay
  const handleRunSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);

    const logsToRun = isShieldActive 
      ? currentVector.simulatedLogsShielded 
      : currentVector.simulatedLogsUnshielded;

    setTerminalLogs(prev => [
      ...prev,
      "----------------------------------------------------------------------",
      `[EXEC] Initiating Attack Vector Simulation: ${currentVector.cwe}`,
      `[PAYLOAD] ${currentVector.payload.substring(0, 70)}...`
    ]);

    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < logsToRun.length) {
        const nextLog = logsToRun[logIndex];
        setTerminalLogs(prev => [...prev, nextLog]);
        logIndex++;
      } else {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 450);
  };

  // Toggle Zero-Trust Shield
  const handleToggleShield = () => {
    const nextState = !isShieldActive;
    setIsShieldActive(nextState);
    if (nextState) {
      setActiveCodeTab('patched');
    } else {
      setActiveCodeTab('vulnerable');
    }
  };

  return (
    <div className="space-y-8 pb-16 text-white max-w-7xl mx-auto">
      
      {/* 1. Header with Live War Room Status & Zero-Trust Shield Toggle */}
      <ScrollReveal direction="down" distance={15}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#89CFF0]/20">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#08132B] border border-[#89CFF0]/40 text-[#89CFF0] text-[11px] font-bold tracking-wider uppercase rounded-none shadow-xs mb-2">
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              Live Ethical Penetration & Exploit War Room
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Cyber Threat Sandbox & Exploit Terminal</span>
              <span className={`text-xs font-mono font-bold px-2.5 py-1 border uppercase ${
                isShieldActive 
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50' 
                  : 'bg-red-950/80 text-red-300 border-red-500/50 animate-pulse'
              }`}>
                {isShieldActive ? "SHIELD ENGAGED" : "UNSHIELDED (VULNERABLE)"}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[#8EA6C8] mt-1 max-w-3xl leading-relaxed">
              Interactive cyber war-room demonstrating real-world exploit payloads against static CWE vulnerabilities detected in repository code, paired with instant Zero-Trust defensive remediation.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleToggleShield}
              className={`px-4 py-2 text-xs font-extrabold rounded-none border transition-all flex items-center gap-2 shadow-md ${
                isShieldActive
                  ? 'bg-emerald-900/90 text-emerald-100 border-emerald-400 hover:bg-emerald-800'
                  : 'bg-red-950/90 text-red-200 border-red-500 hover:bg-red-900 animate-pulse'
              }`}
            >
              {isShieldActive ? <ShieldCheck className="w-4 h-4 text-emerald-300" /> : <ShieldAlert className="w-4 h-4 text-red-400" />}
              <span>{isShieldActive ? "Zero-Trust Shield: ACTIVE" : "DEPLOY ZERO-TRUST SHIELD"}</span>
            </button>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold bg-[#08132B] hover:bg-[#89CFF0]/10 text-white border border-[#89CFF0]/40 rounded-none transition-all flex items-center gap-2 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#89CFF0]" />
              <span>Red-Team Report</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* 2. Target Repository Selector & Threat Posture Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Target Repo Picker */}
        <div className="liquid-glass-card rounded-none p-4 border border-[#89CFF0]/25 shadow-xs">
          <span className="text-[10px] font-mono font-bold text-[#8EA6C8] uppercase block">Audited Target System</span>
          <select
            value={targetRepo}
            onChange={(e) => setTargetRepo(e.target.value)}
            className="mt-1 bg-[#08132B] text-white border border-[#89CFF0]/40 text-xs py-1 px-2 w-full rounded-none font-mono font-bold focus:outline-none focus:border-[#89CFF0]"
          >
            <option value="ibanmondal/CODE-BEAST-AI">ibanmondal/CODE-BEAST-AI (Primary)</option>
            <option value="cybercore/distributed-auth-vault">distributed-auth-vault</option>
            <option value="infra-ops/micro-cache-orchestrator">micro-cache-orchestrator</option>
            <option value="quant-team/quantum-ml-flow">quantum-ml-flow</option>
          </select>
          <span className="text-[10px] text-[#89CFF0] mt-1 block">Static Code Engine Synchronized</span>
        </div>

        {/* Global Threat Severity */}
        <div className="liquid-glass-card rounded-none p-4 border border-[#89CFF0]/25 shadow-xs">
          <span className="text-[10px] font-mono font-bold text-[#8EA6C8] uppercase block">Global CVSS Rating</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-black font-mono ${isShieldActive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isShieldActive ? "0.0" : currentVector.cvss.toFixed(1)}
            </span>
            <span className={`text-xs font-mono font-bold ${isShieldActive ? 'text-emerald-300' : 'text-red-400'}`}>
              {isShieldActive ? "DEFENDED" : currentVector.severity.toUpperCase()}
            </span>
          </div>
          <span className="text-[10px] text-[#8EA6C8] mt-0.5 block">
            {isShieldActive ? "Risk completely mitigated" : "Immediate exploitability detected"}
          </span>
        </div>

        {/* Attack Vector Selected */}
        <div className="liquid-glass-card rounded-none p-4 border border-[#89CFF0]/25 shadow-xs">
          <span className="text-[10px] font-mono font-bold text-[#8EA6C8] uppercase block">Active Vector</span>
          <span className="text-sm font-bold text-white mt-1 block truncate text-[#BAE6FD] font-mono">
            {currentVector.cwe}
          </span>
          <span className="text-[10px] text-[#89CFF0] mt-0.5 block truncate">
            {currentVector.name}
          </span>
        </div>

        {/* Defense Barrier */}
        <div className="liquid-glass-card rounded-none p-4 border border-[#89CFF0]/25 shadow-xs">
          <span className="text-[10px] font-mono font-bold text-[#8EA6C8] uppercase block">Zero-Trust WAF Filter</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-xl font-bold font-mono ${isShieldActive ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isShieldActive ? "FILTER ENGAGED" : "OFFLINE"}
            </span>
          </div>
          <span className="text-[10px] text-[#8EA6C8] mt-0.5 block">
            {isShieldActive ? "Signatures dropped at gateway" : "Direct AST code execution"}
          </span>
        </div>

      </div>

      {/* 3. Attack Vector Selector Matrix */}
      <div className="liquid-glass-card rounded-none p-3.5 border border-[#89CFF0]/25 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Bug className="w-4 h-4 text-[#89CFF0]" />
            <span className="font-bold text-white uppercase font-mono">Select Attack Vector to Exploit in Sandbox:</span>
          </div>
          <span className="text-[11px] text-[#8EA6C8]">
            Click any vector below to inspect target endpoint, payload syntax, and live defense.
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {THREAT_VECTORS.map((vec) => {
            const isSelected = vec.id === currentVector.id;
            return (
              <button
                key={vec.id}
                onClick={() => setSelectedVectorId(vec.id)}
                className={`p-3 text-left border rounded-none transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#0E2248] border-[#89CFF0] shadow-[0_0_15px_rgba(137,207,240,0.3)]'
                    : 'bg-[#08132B]/80 border-[#89CFF0]/20 hover:border-[#89CFF0]/50 hover:bg-[#08132B]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-[#89CFF0]">{vec.cwe}</span>
                    <span className={`text-[9px] font-mono font-bold px-1 ${
                      vec.severity === 'Critical' ? 'bg-red-950 text-red-300 border border-red-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}>
                      CVSS {vec.cvss}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white block truncate leading-snug">{vec.name}</span>
                </div>

                <div className="mt-2 pt-1.5 border-t border-[#89CFF0]/10 text-[10px] font-mono text-[#8EA6C8] flex justify-between">
                  <span>{vec.category.split(' ')[0]}</span>
                  <span className="text-white font-bold">{vec.targetMethod}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. DUAL-PANE WAR ROOM: INTERACTIVE TERMINAL & CODE DIFF BENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANE: LIVE INTERACTIVE HACKER TERMINAL (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="liquid-glass-card rounded-none p-5 border-2 border-[#89CFF0]/30 shadow-xl space-y-4 bg-[#030712]">
            
            {/* Terminal Window Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#89CFF0]/20">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-mono font-bold text-[#89CFF0] ml-2">
                  terminal://red-team-sandbox.sh
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#8EA6C8]">Mode:</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 border ${
                  isShieldActive ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/60' : 'text-red-400 border-red-500/40 bg-red-950/60'
                }`}>
                  {isShieldActive ? "DEFENSIVE MITIGATION" : "EXPLOIT EXECUTION"}
                </span>
              </div>
            </div>

            {/* Target Vector Metadata Banner */}
            <div className="p-3 bg-[#08132B] border border-[#89CFF0]/20 text-xs font-mono space-y-1">
              <div className="flex justify-between text-[#8EA6C8]">
                <span>ENDPOINT:</span>
                <strong className="text-white">{currentVector.targetMethod} {currentVector.targetEndpoint}</strong>
              </div>
              <div className="flex justify-between text-[#8EA6C8]">
                <span>PAYLOAD SYNTAX:</span>
                <span className="text-amber-300 truncate max-w-[280px]" title={currentVector.payload}>
                  {currentVector.payload}
                </span>
              </div>
            </div>

            {/* Terminal Output Screen */}
            <div className="bg-[#02050e] border border-[#89CFF0]/30 p-4 font-mono text-xs text-[#89CFF0] h-[340px] overflow-y-auto space-y-1.5 select-text leading-relaxed shadow-inner">
              {terminalLogs.map((log, idx) => {
                const isCritical = log.includes("[!]") || log.includes("[!!!]");
                const isBlocked = log.includes("[✓]") || log.includes("[-]");
                const isHeader = log.includes("[*]") || log.includes("[EXEC]");
                return (
                  <div 
                    key={idx} 
                    className={`${
                      isCritical ? 'text-red-400 font-bold' : isBlocked ? 'text-emerald-300 font-bold' : isHeader ? 'text-white' : 'text-[#89CFF0]/90'
                    }`}
                  >
                    {log}
                  </div>
                );
              })}
              {isSimulating && (
                <div className="text-amber-300 animate-pulse flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>Transmitting payload packets across network layer...</span>
                </div>
              )}
              <div ref={terminalEndRef} />
            </div>

            {/* Terminal Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <CodeBeastLiquidButton
                  onClick={handleRunSimulation}
                  variant={isShieldActive ? "secondary" : "primary"}
                  size="sm"
                  label={isSimulating ? "Transmitting..." : "Launch Exploit Simulation"}
                  icon={isSimulating ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 ml-0.5" />}
                />

                <button
                  onClick={() => {
                    setTerminalLogs([
                      `[root@codebeast-sandbox:~# reset] Terminal cleared.`,
                      `[*] Target ready: ${currentVector.name}`
                    ]);
                  }}
                  className="px-3 py-2 text-xs font-semibold bg-[#08132B] hover:bg-[#0E2248] text-[#8EA6C8] hover:text-white border border-[#89CFF0]/30 rounded-none transition-colors"
                  title="Clear Terminal"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-[11px] font-mono text-[#8EA6C8]">
                <span>Status: </span>
                <strong className={isShieldActive ? "text-emerald-400" : "text-red-400"}>
                  {isShieldActive ? "Shield Armed (Attack Neutralized)" : "Unshielded (Vulnerable)"}
                </strong>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT PANE: CODE INSPECTOR & ZERO-TRUST REMEDIATION (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="liquid-glass-card rounded-none p-5 sm:p-6 border-2 border-[#89CFF0]/35 shadow-xl space-y-5">
            
            {/* Header & Code Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#89CFF0]/20">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#89CFF0] uppercase tracking-wider block">
                  SOURCE CODE INSPECTOR & REMEDIATION
                </span>
                <h3 className="text-base font-bold text-white font-mono truncate max-w-[280px]">
                  {currentVector.targetFile}
                </h3>
              </div>

              <div className="flex items-center gap-1 bg-[#08132B] p-0.5 border border-[#89CFF0]/30 text-xs font-mono">
                <button
                  onClick={() => setActiveCodeTab('vulnerable')}
                  className={`px-3 py-1 transition-colors ${
                    activeCodeTab === 'vulnerable'
                      ? 'bg-red-950/80 text-red-300 font-bold border border-red-500/40'
                      : 'text-[#8EA6C8] hover:text-white'
                  }`}
                >
                  Vulnerable Flaw
                </button>
                <button
                  onClick={() => setActiveCodeTab('patched')}
                  className={`px-3 py-1 transition-colors ${
                    activeCodeTab === 'patched'
                      ? 'bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/40'
                      : 'text-[#8EA6C8] hover:text-white'
                  }`}
                >
                  Zero-Trust Patch
                </button>
              </div>
            </div>

            {/* Code Editor Window */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px] font-mono text-[#8EA6C8]">
                <span>File: {currentVector.targetFile}:L{currentVector.vulnerableLine}</span>
                <span className={activeCodeTab === 'vulnerable' ? 'text-red-400' : 'text-emerald-400'}>
                  {activeCodeTab === 'vulnerable' ? 'FLAW DETECTED' : 'PATCH VERIFIED'}
                </span>
              </div>

              <div className="bg-[#02050e] border border-[#89CFF0]/30 p-4 font-mono text-xs rounded-none overflow-x-auto text-[#DCE4FE] shadow-inner relative">
                <pre className="leading-relaxed">
                  {activeCodeTab === 'vulnerable' ? currentVector.vulnerableCode : currentVector.securePatchCode}
                </pre>
              </div>
            </div>

            {/* Architectural Patch Explanation */}
            <div className="p-3 bg-[#08132B] border border-[#89CFF0]/25 space-y-1 text-xs">
              <span className="font-bold text-[#89CFF0] uppercase font-mono block">
                Remediation Rationale & Defense-in-Depth:
              </span>
              <p className="text-[#BAE6FD] leading-relaxed text-[11px]">
                {currentVector.patchExplanation}
              </p>
            </div>

            {/* Impact Blast Radius Meters */}
            <div className="space-y-2 pt-2 border-t border-[#89CFF0]/15">
              <span className="text-xs font-bold text-white uppercase font-mono block">
                Vulnerability Blast Radius Impact:
              </span>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-[#08132B] border border-[#89CFF0]/20 space-y-1">
                  <span className="text-[10px] text-[#8EA6C8] uppercase font-mono block">Confidentiality</span>
                  <div className="flex justify-between items-baseline font-mono">
                    <span className={`text-base font-bold ${isShieldActive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isShieldActive ? "0%" : `${currentVector.confidentialityImpact}%`}
                    </span>
                    <span className="text-[10px] text-[#8EA6C8]">{isShieldActive ? "Protected" : "Exposed"}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#08132B] border border-[#89CFF0]/20 space-y-1">
                  <span className="text-[10px] text-[#8EA6C8] uppercase font-mono block">Integrity</span>
                  <div className="flex justify-between items-baseline font-mono">
                    <span className={`text-base font-bold ${isShieldActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {isShieldActive ? "0%" : `${currentVector.integrityImpact}%`}
                    </span>
                    <span className="text-[10px] text-[#8EA6C8]">{isShieldActive ? "Verified" : "Tampered"}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-[#08132B] border border-[#89CFF0]/20 space-y-1">
                  <span className="text-[10px] text-[#8EA6C8] uppercase font-mono block">Availability</span>
                  <div className="flex justify-between items-baseline font-mono">
                    <span className={`text-base font-bold ${isShieldActive ? 'text-emerald-400' : 'text-blue-400'}`}>
                      {isShieldActive ? "0%" : `${currentVector.availabilityImpact}%`}
                    </span>
                    <span className="text-[10px] text-[#8EA6C8]">{isShieldActive ? "100% Up" : "Degraded"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Shield Toggle Banner */}
            <div className={`p-3.5 border flex items-center justify-between gap-3 ${
              isShieldActive 
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200' 
                : 'bg-red-950/80 border-red-500/50 text-red-200'
            }`}>
              <div className="flex items-center gap-2 text-xs">
                {isShieldActive ? <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" /> : <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />}
                <div>
                  <strong className="block text-white">
                    {isShieldActive ? "Zero-Trust Shield Armed" : "Exploit Vector Active & Unmitigated"}
                  </strong>
                  <span className="text-[11px] opacity-80">
                    {isShieldActive 
                      ? "Attacks will be dropped at the gateway layer." 
                      : "Click 'Deploy Zero-Trust Shield' to apply defensive patches."}
                  </span>
                </div>
              </div>

              <button
                onClick={handleToggleShield}
                className={`px-3 py-1.5 text-xs font-bold rounded-none border transition-colors shrink-0 ${
                  isShieldActive 
                    ? 'bg-emerald-800 text-white border-emerald-400 hover:bg-emerald-700' 
                    : 'bg-red-700 text-white border-red-400 hover:bg-red-600'
                }`}
              >
                {isShieldActive ? "Disable Shield" : "Engage Shield"}
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* 5. OFFICIAL PRINTABLE RED-TEAM PENETRATION REPORT MODAL */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#08132B] border-2 border-[#89CFF0]/50 text-white p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl rounded-none font-sans"
            >
              
              {/* Report Header */}
              <div className="text-center pb-4 border-b-2 border-white/20 space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-400 block">
                  CODE BEAST AI — CYBERSECURITY DEFENSE LABS
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  OFFICIAL RED-TEAM EXPLOIT & ZERO-TRUST AUDIT REPORT
                </h2>
                <p className="text-xs text-[#BAE6FD]">
                  Target: {targetRepo} · Presided by Department of AI & ML · HKBKCE
                </p>
              </div>

              {/* Assessment Summary */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
                <div className="p-3 bg-[#08132B] border border-[#89CFF0]/30">
                  <span className="text-[#8EA6C8] uppercase block text-[10px]">Vulnerability</span>
                  <strong className="text-white text-sm block mt-0.5">{currentVector.cwe}</strong>
                  <span className="text-red-400 font-bold">{currentVector.severity}</span>
                </div>
                <div className="p-3 bg-[#08132B] border border-[#89CFF0]/30">
                  <span className="text-[#8EA6C8] uppercase block text-[10px]">Base CVSS v3.1</span>
                  <strong className="text-red-400 text-2xl block mt-0.5">{currentVector.cvss}</strong>
                  <span className="text-[#8EA6C8]">Exploitable</span>
                </div>
                <div className="p-3 bg-[#08132B] border border-[#89CFF0]/30">
                  <span className="text-[#8EA6C8] uppercase block text-[10px]">Zero-Trust Status</span>
                  <strong className={`text-sm block mt-0.5 ${isShieldActive ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isShieldActive ? "MITIGATED" : "ACTION REQUIRED"}
                  </strong>
                  <span className="text-[#8EA6C8]">{isShieldActive ? "Patched" : "Unshielded"}</span>
                </div>
              </div>

              {/* Exploit Vector Details */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-white uppercase font-mono block">Penetration Test Parameters:</span>
                <div className="p-3 bg-[#040914] border border-[#89CFF0]/20 space-y-1.5 font-mono text-[11px]">
                  <div><strong className="text-[#89CFF0]">Target Endpoint:</strong> <span className="text-white">{currentVector.targetMethod} {currentVector.targetEndpoint}</span></div>
                  <div><strong className="text-[#89CFF0]">Target File:</strong> <span className="text-white">{currentVector.targetFile}:L{currentVector.vulnerableLine}</span></div>
                  <div><strong className="text-[#89CFF0]">Simulated Payload:</strong> <span className="text-amber-300 break-all">{currentVector.payload}</span></div>
                  <div><strong className="text-[#89CFF0]">Business Impact:</strong> <span className="text-[#BAE6FD]">{currentVector.impactSummary}</span></div>
                </div>
              </div>

              {/* Verified Remediation Code */}
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-white uppercase font-mono block">Verified Defensive Patch:</span>
                <div className="bg-[#02050e] border border-emerald-500/40 p-3 font-mono text-[11px] text-emerald-200">
                  <pre className="overflow-x-auto">{currentVector.securePatchCode}</pre>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/20 text-xs">
                <div className="space-y-1">
                  <div className="h-10 border-b border-dashed border-[#8EA6C8]/60" />
                  <strong className="block text-white">Dr. Tabassum Ara</strong>
                  <span className="text-[11px] text-[#8EA6C8] block">Professor & Head of Department, AI & ML</span>
                  <span className="text-[10px] text-[#89CFF0] block">Faculty Guide & Academic Mentor</span>
                </div>

                <div className="space-y-1 text-right">
                  <div className="h-10 border-b border-dashed border-[#8EA6C8]/60" />
                  <strong className="block text-white">Red-Team Ethical Auditor</strong>
                  <span className="text-[11px] text-[#8EA6C8] block">Code Beast AI Automated Defense Kernel</span>
                  <span className="text-[10px] text-[#89CFF0] block">Zero-Trust Verification Certified</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#89CFF0]/20">
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold bg-[#08132B] text-[#8EA6C8] hover:text-white border border-[#89CFF0]/20 rounded-none"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-xs font-bold bg-[#89CFF0] text-[#08132B] hover:bg-[#BAE6FD] transition-colors rounded-none flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Formal Audit Certificate</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
