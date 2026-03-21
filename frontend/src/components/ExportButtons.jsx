import React from "react";
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

  // Optional direct links if you mounted /files in the backend
  const hasFilesMount = true; // set false if you didn’t add app.mount("/files", ...)
  return (
    <div className="p-4 border rounded space-y-2 text-sm">
      <div className="font-semibold mb-1">Export / Download</div>
      <div className="flex flex-wrap gap-2">
        <button onClick={exportLatest} className="px-3 py-1 rounded bg-blue-600 text-white">
          Download Latest Metrics (JSON)
        </button>
        <button onClick={exportHistory} className="px-3 py-1 rounded bg-indigo-600 text-white">
          Download History (JSON)
        </button>
      </div>
      {hasFilesMount && (
        <div className="text-xs text-gray-600">
          Or download raw files:
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li><a className="underline" href={`${API_BASE}/files/latest_metrics.json`} target="_blank" rel="noreferrer">/files/latest_metrics.json</a></li>
            <li><a className="underline" href={`${API_BASE}/files/baseline/metrics.json`} target="_blank" rel="noreferrer">/files/baseline/metrics.json</a></li>
            <li><a className="underline" href={`${API_BASE}/files/hybrid/metrics.json`} target="_blank" rel="noreferrer">/files/hybrid/metrics.json</a></li>
            <li><a className="underline" href={`${API_BASE}/files/history/metrics_log.json`} target="_blank" rel="noreferrer">/files/history/metrics_log.json</a></li>
          </ul>
        </div>
      )}
    </div>
  );
}
