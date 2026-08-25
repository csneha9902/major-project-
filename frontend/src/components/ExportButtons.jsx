import React from "react";
import GlowButton from "./ui/GlowButton";
import { Download, History } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function downloadBlobJSON(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  a.remove(); URL.revokeObjectURL(url);
}

export default function ExportButtons() {
  const exportLatest = async () => {
    try {
      const res = await fetch(`${API_BASE}/results/metrics`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      downloadBlobJSON("latest_metrics.json", data);
    } catch (e) {
      alert("Failed to fetch metrics. Run pipeline once and try again.");
      console.error(e);
    }
  };

  const exportHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/results/history`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      downloadBlobJSON("metrics_history.json", data);
    } catch (e) {
      alert("Failed to fetch history. Run pipeline once and try again.");
      console.error(e);
    }
  };

  const hasFilesMount = true;
  return (
    <div className="glass-card p-5">
      <div className="font-heading font-bold text-[var(--text-primary)] mb-3">Export Data & Metrics</div>
      <div className="flex flex-wrap gap-3">
        <GlowButton variant="success" onClick={exportLatest}>
          <Download size={16} />
          Latest Metrics (JSON)
        </GlowButton>
        <GlowButton variant="cyan" onClick={exportHistory}>
          <History size={16} />
          History Log (JSON)
        </GlowButton>
      </div>
      {hasFilesMount && (
        <div className="text-xs text-[var(--text-muted)] mt-4">
          Direct File Downloads:
          <ul className="mt-2 space-y-1.5 font-mono">
            <li><a className="text-[var(--accent-cyan)] hover:underline" href={`${API_BASE}/files/latest_metrics.json`} target="_blank" rel="noreferrer">/files/latest_metrics.json</a></li>
            <li><a className="text-[var(--accent-cyan)] hover:underline" href={`${API_BASE}/files/baseline/metrics.json`} target="_blank" rel="noreferrer">/files/baseline/metrics.json</a></li>
            <li><a className="text-[var(--accent-cyan)] hover:underline" href={`${API_BASE}/files/snn/metrics.json`} target="_blank" rel="noreferrer">/files/snn/metrics.json</a></li>
            <li><a className="text-[var(--accent-cyan)] hover:underline" href={`${API_BASE}/files/history/metrics_log.json`} target="_blank" rel="noreferrer">/files/history/metrics_log.json</a></li>
          </ul>
        </div>
      )}
    </div>
  );
}
