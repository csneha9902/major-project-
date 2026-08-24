import { useEffect, useRef, useState, useCallback } from "react";
import { API_BASE } from "../api";

function toWsUrl(httpUrl) {
  try {
    const u = new URL(httpUrl);
    const protocol = u.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${u.host}/api/data`;
  } catch {
    return "ws://localhost:8000/api/data";
  }
}

export function useDataStream() {
  const [frame, setFrame] = useState(null);
  const [connected, setConnected] = useState(false);
  const [running, setRunning] = useState(true);
  const [currentMode, setCurrentMode] = useState("Neutral");
  const [modeChanging, setModeChanging] = useState(false);
  const [ingestion, setIngestion] = useState({ active_source: "internal", external_configured: false });
  const wsRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    // Try WebSocket first
    const wsUrl = toWsUrl(API_BASE);
    let ws;
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onopen = () => {
        setConnected(true);
      };
      ws.onmessage = (ev) => {
        try { 
          setFrame(JSON.parse(ev.data)); 
        } catch (e) {
          // Silently ignore parse errors
        }
      };
      ws.onerror = (error) => { 
        // Silently handle WebSocket errors - fallback to polling
        setConnected(false); 
      };
      ws.onclose = (event) => { 
        // Only log if not a normal closure
        if (event.code !== 1000) {
          // Normal closure, no error needed
        }
        setConnected(false); 
      };
    } catch (error) {
      // WebSocket not supported or connection failed - will use polling
      setConnected(false);
    }

    // Fallback polling
    const startPolling = () => {
      if (pollRef.current) return;
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/api/snapshot`);
          if (res.ok) {
            const newFrame = await res.json();
            setFrame(prev => {
              // Only update if timestamp changed
              if (!prev || prev.timestamp !== newFrame.timestamp) {
                return newFrame;
              }
              return prev;
            });
          }
        } catch {}
      }, 1500);
    };

    // Start polling after a delay if WebSocket doesn't connect
    const pollTimeout = setTimeout(() => { 
      if (!connected && !pollRef.current) {
        startPolling();
      }
    }, 2000);

    return () => {
      clearTimeout(pollTimeout);
      // Clean up WebSocket connection
      if (wsRef.current) {
        try { 
          // Only close if connection is open or connecting
          if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
            wsRef.current.close(1000, 'Component unmounting'); // Normal closure
          }
        } catch (e) {
          // Ignore errors during cleanup
        }
        wsRef.current = null;
      }
      // Clean up polling
      if (pollRef.current) { 
        clearInterval(pollRef.current); 
        pollRef.current = null; 
      }
    };
  }, []);

  // Poll simulation status less frequently
  useEffect(() => {
    const statusInterval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/sim/status`);
        if (res.ok) {
          const status = await res.json();
          if (status.running !== running) {
            setRunning(status.running);
          }
          if (status.mode && status.mode !== currentMode) {
            setCurrentMode(status.mode);
          }
          if (status.ingestion) {
            setIngestion(status.ingestion);
          }
        }
      } catch {}
    }, 5000); // Reduced frequency
    
    return () => clearInterval(statusInterval);
  }, [running]);

  const startSimulation = useCallback(async () => {
    setRunning(true); // Immediate UI update
    try {
      const res = await fetch(`${API_BASE}/api/sim/start`, { method: 'POST' });
      if (!res.ok) setRunning(false); // Revert on failure
    } catch {
      setRunning(false); // Revert on error
    }
  }, []);

  const stopSimulation = useCallback(async () => {
    setRunning(false); // Immediate UI update
    try {
      const res = await fetch(`${API_BASE}/api/sim/stop`, { method: 'POST' });
      if (!res.ok) setRunning(true); // Revert on failure
    } catch {
      setRunning(true); // Revert on error
    }
  }, []);

  const changeMode = useCallback(async (mode) => {
    if (modeChanging) return; // Prevent double-clicks
    
    const prevMode = currentMode;
    setCurrentMode(mode); // Immediate UI update
    setModeChanging(true);
    
    try {
      const res = await fetch(`${API_BASE}/api/sim/mode`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ mode }) 
      });
      if (!res.ok) {
        setCurrentMode(prevMode); // Revert on failure
      }
    } catch {
      setCurrentMode(prevMode); // Revert on error
    } finally {
      setModeChanging(false);
    }
  }, [currentMode, modeChanging]);

  return { frame, connected, running, currentMode, modeChanging, ingestion, startSimulation, stopSimulation, changeMode };
}
