import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import './IoTSimulator.css';

export default function IoTSimulator() {
  const [nodes, setNodes] = useState({
    "Node_01_Edge_YOLO": true,
    "Node_02_Gateway": true,
    "Node_03_MQTT_Broker": true
  });
  const [load, setLoad] = useState(45);
  const [dataPoints, setDataPoints] = useState(Array(25).fill(40));
  const [logs, setLogs] = useState([
    "[MQTT] [system] Listening on broker port 1883...",
    "[MQTT] [system] Connection established to dashboard server.",
    "[MQTT] [Node_02_Gateway] PUB: {\"cpu_temp\": 42.5, \"status\": \"ACTIVE\"}"
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      let baseVal = 30 + (load * 0.4);
      let noise = (Math.random() * 14 - 7);

      let nodeCount = Object.values(nodes).filter(Boolean).length;
      if (nodeCount === 0) {
        baseVal = 0;
        noise = 0;
      } else {
        baseVal = baseVal * (nodeCount / 3);
      }

      const nextVal = Math.min(100, Math.max(0, Math.round(baseVal + noise)));

      setDataPoints(prev => {
        const nextList = [...prev.slice(1), nextVal];
        return nextList;
      });

      if (nodeCount > 0) {
        const timestamp = new Date().toLocaleTimeString();
        const activeNodeKeys = Object.keys(nodes).filter(k => nodes[k]);
        const randomNode = activeNodeKeys[Math.floor(Math.random() * activeNodeKeys.length)];

        let newLog = '';
        if (nextVal > 80) {
          newLog = `[${timestamp}] [ALERT] [${randomNode}] High threshold breached: ${nextVal}%!`;
        } else {
          newLog = `[${timestamp}] [MQTT] [${randomNode}] PUB: {"value": ${nextVal}, "load": ${load}, "status": "OK"}`;
        }

        setLogs(prev => [...prev.slice(-15), newLog]);
      } else {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev.slice(-15), `[${timestamp}] [system] [WARN] All edge telemetry nodes inactive.`]);
      }

    }, 450);

    return () => clearInterval(interval);
  }, [nodes, load]);

  const toggleNode = (nodeKey) => {
    setNodes(prev => ({ ...prev, [nodeKey]: !prev[nodeKey] }));
  };

  const svgWidth = 500;
  const svgHeight = 180;
  const pointsCount = dataPoints.length;

  const pointsStr = dataPoints.map((val, i) => {
    const x = (i * (svgWidth / (pointsCount - 1)));
    const y = svgHeight - (val * (svgHeight / 100));
    return `${x},${y}`;
  }).join(' ');

  const thresholdY = svgHeight - (80 * (svgHeight / 100));
  const isHighAlert = dataPoints[dataPoints.length - 1] > 80;

  return (
    <div className="iot-sandbox-grid">
      <div className="iot-graph-card">
        <div style={{ display: 'flex', justifySelf: 'space-between', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Telemetry Stream (Live)</h3>
          <span style={{ fontSize: '0.85rem', color: isHighAlert ? '#ef4444' : '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span className={`status-dot-pulse ${isHighAlert ? 'inactive' : ''}`} style={{ backgroundColor: isHighAlert ? '#ef4444' : '#10b981' }}></span>
            {isHighAlert ? 'OVERLOAD WARNING' : 'SYSTEM HEALTHY'}
          </span>
        </div>

        <div style={{ position: 'relative' }}>
          <svg className="iot-telemetry-svg" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
            {[25, 50, 75].map((lvl) => {
              const y = svgHeight - (lvl * (svgHeight / 100));
              return (
                <line
                  key={lvl}
                  x1="0"
                  y1={y}
                  x2={svgWidth}
                  y2={y}
                  stroke="var(--border-color)"
                  strokeWidth="0.5"
                  strokeDasharray="4 4"
                />
              );
            })}

            <line
              x1="0"
              y1={thresholdY}
              x2={svgWidth}
              y2={thresholdY}
              stroke="#ef4444"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              opacity="0.8"
            />

            <polyline
              fill="none"
              stroke={isHighAlert ? '#ef4444' : 'var(--accent-color)'}
              strokeWidth="2.5"
              points={pointsStr}
              style={{ transition: 'stroke 0.3s ease' }}
            />
          </svg>
        </div>

        {isHighAlert && (
          <div className="system-warning-banner">
            <AlertTriangle size={16} /> Edge node thermal limits exceeded. Regulate CPU load immediately!
          </div>
        )}

        <div className="stats-grid-mini" style={{ marginTop: '0.5rem' }}>
          <div className="stat-box-mini">
            <div className="stat-box-mini-label">Active Nodes</div>
            <div className="stat-box-mini-val">{Object.values(nodes).filter(Boolean).length} / 3</div>
          </div>
          <div className="stat-box-mini">
            <div className="stat-box-mini-label">Latency (MQTT)</div>
            <div className="stat-box-mini-val">~12 ms</div>
          </div>
          <div className="stat-box-mini">
            <div className="stat-box-mini-label">Current Reading</div>
            <div className="stat-box-mini-val" style={{ color: isHighAlert ? '#ef4444' : 'var(--accent-color)' }}>{dataPoints[dataPoints.length - 1]}%</div>
          </div>
          <div className="stat-box-mini">
            <div className="stat-box-mini-label">Frequency</div>
            <div className="stat-box-mini-val">2.2 Hz</div>
          </div>
        </div>
      </div>

      <div className="iot-controls-panel">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Dashboard Controls</h3>

        <div className="control-group">
          <label className="control-label">Regulator Load: <span>{load}% Clock</span></label>
          <input
            type="range"
            min="10"
            max="100"
            value={load}
            onChange={(e) => setLoad(parseInt(e.target.value))}
            className="sandbox-slider"
          />
        </div>

        <div className="control-group">
          <label className="control-label" style={{ marginBottom: '0.25rem' }}>Edge IoT Nodes</label>
          <div className="node-toggles-grid">
            <div className="node-toggle-row">
              <div className="node-name-wrapper">
                <span className={`status-dot-pulse ${nodes.Node_01_Edge_YOLO ? '' : 'inactive'}`}></span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Node-01 (YOLOv8 Core)</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={nodes.Node_01_Edge_YOLO}
                  onChange={() => toggleNode('Node_01_Edge_YOLO')}
                />
                <span className="switch-slider"></span>
              </label>
            </div>

            <div className="node-toggle-row">
              <div className="node-name-wrapper">
                <span className={`status-dot-pulse ${nodes.Node_02_Gateway ? '' : 'inactive'}`}></span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Node-02 (Gateway Core)</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={nodes.Node_02_Gateway}
                  onChange={() => toggleNode('Node_02_Gateway')}
                />
                <span className="switch-slider"></span>
              </label>
            </div>

            <div className="node-toggle-row">
              <div className="node-name-wrapper">
                <span className={`status-dot-pulse ${nodes.Node_03_MQTT_Broker ? '' : 'inactive'}`}></span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Node-03 (MQTT Broker)</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={nodes.Node_03_MQTT_Broker}
                  onChange={() => toggleNode('Node_03_MQTT_Broker')}
                />
                <span className="switch-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="terminal-monitor" style={{ minHeight: '130px', maxHeight: '160px' }}>
          <div className="monitor-header" style={{ padding: '0.4rem 0.8rem' }}>
            <div className="monitor-title" style={{ fontSize: '0.65rem' }}>MQTT Pipeline Broker Stream</div>
          </div>
          <div className="monitor-body iot-log" style={{ padding: '0.6rem 0.8rem', fontSize: '0.75rem', maxHeight: '120px' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ fontFamily: 'monospace', marginBottom: '0.2rem', color: log.includes('ALERT') ? '#ef4444' : log.includes('WARN') ? '#f59e0b' : '#10b981' }}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
