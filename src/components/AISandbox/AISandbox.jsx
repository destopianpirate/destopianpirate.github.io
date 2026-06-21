import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import './AISandbox.css';

const aiMockAnswers = [
  {
    keywords: ["iit", "gandhinagar", "iitgn", "study", "university"],
    response: "Ayush Singh is pursuing his B.Tech in Artificial Intelligence at IIT Gandhinagar, having entered in 2025. His research focuses on high-performance deep learning workflows, edge computing optimizations, computer vision (deploying models like YOLOv8 for road defects), and integrating conversational AI models into responsive web spaces like AcadX."
  },
  {
    keywords: ["project", "portfolio", "code", "repos"],
    response: "This portfolio highlights several key engineering achievements: 1. AcadX (a sleek student planner with Gemini AI), 2. AssignmentAI (a PDF study companion using OCR and vision models), 3. RoadGuard AI (an Edge CV road defects tracker), 4. IoT Telemetry Dashboard, and 5. ZeroGPTi (a machine-text grammar and pattern checker)."
  },
  {
    keywords: ["contact", "email", "social", "mail"],
    response: "You can reach Ayush Singh via email at ayushspna4040@gmail.com, find his repositories on GitHub at github.com/destopianpirate, or connect professionally on LinkedIn at linkedin.com/in/ayushxphoenix."
  },
  {
    keywords: ["skills", "language", "stack", "python"],
    response: "Primary capabilities cover: Programming Languages (Python, Javascript, TypeScript, C++), Frontend (React, Next.js, Framer Motion), Backend (Node.js/Express, Django, Flask), Databases (MongoDB, Firebase), DevOps (Docker, GCP, Vercel), and Edge AI (YOLOv8, OpenCV, Model Quantization)."
  }
];

const defaultAiResponse = "Inference complete. Synthesizing neural connections... The B.Tech AI program at IIT Gandhinagar bridges mathematical foundations, deep learning frameworks, and systems engineering. Combining PyTorch neural engines with responsive client interfaces creates high-fidelity tools that operate efficiently in resource-constrained environments.";

export default function AISandbox() {
  const [model, setModel] = useState('Gemini 2.5 Flash');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(256);
  const [speed, setSpeed] = useState(60);
  const [prompt, setPrompt] = useState('');
  const [outputText, setOutputText] = useState('System ready. Enter prompt and click Generate to start simulation.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [vram, setVram] = useState(2.8);
  const [latency, setLatency] = useState(0);
  const [tokensPerSec, setTokensPerSec] = useState(0);
  const [attentionGrid, setAttentionGrid] = useState(Array(64).fill(0.1));

  const handleGenerate = () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setOutputText('');
    setLatency(0);
    setTokensPerSec(0);

    const query = prompt.toLowerCase();
    let responseText = defaultAiResponse;
    for (const item of aiMockAnswers) {
      if (item.keywords.some(k => query.includes(k))) {
        responseText = item.response;
        break;
      }
    }

    const isPro = model.includes('Pro');
    const baseLatency = isPro ? 320 : 120;
    const modelVram = isPro ? 8.4 : 3.8;
    const finalTokensPerSec = Math.round((speed * (1.1 - (temperature * 0.15))) * (isPro ? 0.6 : 1));

    setVram(modelVram);

    let latencyTimer = 0;
    const latencyInterval = setInterval(() => {
      latencyTimer += 20;
      setLatency(latencyTimer);
      if (latencyTimer >= baseLatency) {
        clearInterval(latencyInterval);

        const tokens = responseText.split(' ');
        let tokenIdx = 0;
        setTokensPerSec(finalTokensPerSec);

        const typingDelay = 1000 / finalTokensPerSec;

        const streamTokens = () => {
          if (tokenIdx < tokens.length) {
            setOutputText(prev => prev + (tokenIdx === 0 ? '' : ' ') + tokens[tokenIdx]);
            setAttentionGrid(Array(64).fill(0).map(() => Math.random() * 0.8 + 0.2));
            setVram(prev => Math.min(16.0, Math.max(1.0, +(prev + (Math.random() * 0.4 - 0.2)).toFixed(2))));

            tokenIdx++;
            setTimeout(streamTokens, typingDelay);
          } else {
            setIsGenerating(false);
            setAttentionGrid(Array(64).fill(0).map(() => Math.random() * 0.15 + 0.05));
          }
        };

        setTimeout(streamTokens, typingDelay);
      }
    }, 20);
  };

  const handleReset = () => {
    setPrompt('');
    setOutputText('System ready. Enter prompt and click Generate to start simulation.');
    setIsGenerating(false);
    setLatency(0);
    setTokensPerSec(0);
    setAttentionGrid(Array(64).fill(0.1));
    setVram(2.8);
  };

  return (
    <div className="sandbox-panel-grid">
      <div className="sandbox-controls-card">
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Engine Parameters</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Adjust hyperparameters and trigger simulated deep learning queries.</p>

        <div className="control-group">
          <label className="control-label">Target Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="sandbox-select"
            disabled={isGenerating}
          >
            <option>Gemini 2.5 Flash</option>
            <option>Gemini 2.5 Pro</option>
            <option>Claude 3.5 Sonnet</option>
            <option>GPT-4o mini</option>
          </select>
        </div>

        <div className="control-group">
          <label className="control-label">Temperature: <span>{temperature}</span></label>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="sandbox-slider"
            disabled={isGenerating}
          />
        </div>

        <div className="control-group">
          <label className="control-label">Max Output Tokens: <span>{maxTokens}</span></label>
          <input
            type="range"
            min="64"
            max="1024"
            step="64"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            className="sandbox-slider"
            disabled={isGenerating}
          />
        </div>

        <div className="control-group">
          <label className="control-label">Generation Speed: <span>{speed} tok/s</span></label>
          <input
            type="range"
            min="10"
            max="120"
            step="5"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            className="sandbox-slider"
            disabled={isGenerating}
          />
        </div>

        <div className="control-group">
          <label className="control-label">User Prompt</label>
          <textarea
            placeholder="Ask about IITGN, my projects, my skills, or write a custom prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="sandbox-input-area"
            disabled={isGenerating}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <button
            className="sandbox-button"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            style={{ flexGrow: 1 }}
          >
            Generate
          </button>
          <button
            className="sandbox-button"
            onClick={handleReset}
            disabled={isGenerating}
            style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-color)', border: '1px solid var(--border-color)', width: '50px', padding: 0 }}
            title="Reset"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      <div className="ai-output-container">
        <div className="terminal-monitor">
          <div className="monitor-header">
            <div className="monitor-dots">
              <span className="monitor-dot red"></span>
              <span className="monitor-dot yellow"></span>
              <span className="monitor-dot green"></span>
            </div>
            <div className="monitor-title">{model} Inference Stream</div>
            <div style={{ width: '40px' }}></div>
          </div>
          <div className="monitor-body">
            {outputText}
            {isGenerating && <span style={{ display: 'inline-block', width: '8px', height: '15px', background: '#38bdf8', marginLeft: '4px', animation: 'pulse 1s infinite' }}></span>}
          </div>
        </div>

        <div className="attention-matrix-card">
          <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-color)', marginBottom: '0.5rem' }}>Inference Telemetry & Attention Head Weights</h4>

          <div className="stats-grid-mini" style={{ marginBottom: '1rem' }}>
            <div className="stat-box-mini">
              <div className="stat-box-mini-label">Latency</div>
              <div className="stat-box-mini-val">{latency} ms</div>
            </div>
            <div className="stat-box-mini">
              <div className="stat-box-mini-label">Gen Rate</div>
              <div className="stat-box-mini-val active-glow">{tokensPerSec} t/s</div>
            </div>
            <div className="stat-box-mini">
              <div className="stat-box-mini-label">VRAM</div>
              <div className="stat-box-mini-val">{vram} GB</div>
            </div>
            <div className="stat-box-mini">
              <div className="stat-box-mini-label">GPU Load</div>
              <div className="stat-box-mini-val" style={{ color: isGenerating ? '#ef4444' : 'var(--text-color)' }}>{isGenerating ? '98%' : '4%'}</div>
            </div>
          </div>

          <div className="attention-grid">
            {attentionGrid.map((val, idx) => (
              <div
                key={idx}
                className="attention-cell"
                style={{ opacity: val }}
                title={`Head weight: ${val.toFixed(3)}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
