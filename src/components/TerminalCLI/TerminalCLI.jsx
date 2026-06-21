import { useState, useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import './TerminalCLI.css';

export default function TerminalCLI({ isOpen, onClose, theme, toggleTheme }) {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState([
    { type: 'welcome', text: "destopianpirate console [Version 1.0.0]\n(c) 2026 Ayush Singh. Type 'help' for commands, Tap screen to focus input on mobile, Press ` (backtick) or click Close to dismiss." }
  ]);
  const [matrixActive, setMatrixActive] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Snake Game State
  const [gameState, setGameState] = useState('cli'); // 'cli', 'snake', 'ttt', 'guess', 'guess_won'
  const [snake, setSnake] = useState([{ x: 10, y: 5 }]);
  const [food, setFood] = useState({ x: 5, y: 3 });
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  // Tic-Tac-Toe State
  const [tttBoard, setTttBoard] = useState(Array(9).fill(' '));
  const [tttStatus, setTttStatus] = useState('Your turn (X). Press keys 1-9 to place, or [Q] to quit:');
  const [tttOver, setTttOver] = useState(false);

  // Guess the Number State
  const [guessTarget, setGuessTarget] = useState(0);
  const [guessAttempts, setGuessAttempts] = useState(0);
  const [guessFeedback, setGuessFeedback] = useState('');

  const canvasRef = useRef(null);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  const checkTttWin = (board, player) => {
    const wins = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];
    return wins.some(combo => combo.every(idx => board[idx] === player));
  };

  const getTttAiMove = (board) => {
    const wins = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    // 1. Can AI win?
    for (let combo of wins) {
      const oCount = combo.filter(idx => board[idx] === 'O').length;
      const emptyCount = combo.filter(idx => board[idx] === ' ').length;
      if (oCount === 2 && emptyCount === 1) {
        return combo.find(idx => board[idx] === ' ');
      }
    }
    // 2. Can AI block player X?
    for (let combo of wins) {
      const xCount = combo.filter(idx => board[idx] === 'X').length;
      const emptyCount = combo.filter(idx => board[idx] === ' ').length;
      if (xCount === 2 && emptyCount === 1) {
        return combo.find(idx => board[idx] === ' ');
      }
    }
    // 3. Take center if open
    if (board[4] === ' ') return 4;
    // 4. Take corner
    const corners = [0, 2, 6, 8];
    const openCorners = corners.filter(idx => board[idx] === ' ');
    if (openCorners.length > 0) {
      return openCorners[Math.floor(Math.random() * openCorners.length)];
    }
    // 5. Take any empty
    const empties = board.map((val, idx) => val === ' ' ? idx : null).filter(val => val !== null);
    return empties[Math.floor(Math.random() * empties.length)];
  };

  const renderTttBoard = () => {
    let boardStr = '  Tic-Tac-Toe vs Bot\n';
    boardStr += ' ╔═══╦═══╦═══╗\n';
    boardStr += ` ║ ${tttBoard[0]} ║ ${tttBoard[1]} ║ ${tttBoard[2]} ║\n`;
    boardStr += ' ╠═══╬═══╬═══╣\n';
    boardStr += ` ║ ${tttBoard[3]} ║ ${tttBoard[4]} ║ ${tttBoard[5]} ║\n`;
    boardStr += ' ╠═══╬═══╬═══╣\n';
    boardStr += ` ║ ${tttBoard[6]} ║ ${tttBoard[7]} ║ ${tttBoard[8]} ║\n`;
    boardStr += ' ╚═══╩═══╩═══╝\n\n';
    boardStr += ' Cell map:\n 1 │ 2 │ 3 \n───┼───┼───\n 4 │ 5 │ 6 \n───┼───┼───\n 7 │ 8 │ 9 \n\n';
    boardStr += ` Status: ${tttStatus}\n`;
    return boardStr;
  };

  const renderGuessGame = () => {
    let boardStr = '  Guess the Number (1 - 100)\n';
    boardStr += ' ┌─────────────────────────┐\n';
    boardStr += ` │ Attempts: ${guessAttempts.toString().padEnd(14)}│\n`;
    boardStr += ' └─────────────────────────┘\n\n';
    boardStr += ` ${guessFeedback}\n\n`;
    if (gameState === 'guess_won') {
      boardStr += ' Press [Enter] to return to CLI...';
    } else {
      boardStr += ' Type guess below and press [Enter] (or escape/q to quit):';
    }
    return boardStr;
  };

  const directionRef = useRef(direction);
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const scoreRef = useRef(score);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, gameState]);

  useEffect(() => {
    if (!matrixActive || !canvasRef.current || !isOpen) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;

    const columns = Math.floor(canvas.width / 14) + 1;
    const yPos = Array(columns).fill(0);

    let animationId;
    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 12, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#10b981';
      ctx.font = '12px monospace';

      for (let i = 0; i < yPos.length; i++) {
        const char = String.fromCharCode(Math.floor(Math.random() * 96) + 33);
        const x = i * 14;
        const y = yPos[i];

        ctx.fillText(char, x, y);

        if (y > 100 + Math.random() * 10000) {
          yPos[i] = 0;
        } else {
          yPos[i] += 14;
        }
      }
      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, [matrixActive, isOpen]);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [history, gameState]);

  // Snake Game Loop
  useEffect(() => {
    if (gameState !== 'snake') return;

    const gameTick = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = { x: head.x + directionRef.current.x, y: head.y + directionRef.current.y };

        // Wall collision
        if (newHead.x < 0 || newHead.x >= 20 || newHead.y < 0 || newHead.y >= 10) {
          endGame();
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
          endGame();
          return prevSnake;
        }

        // Eat food
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => {
            const nextScore = s + 1;
            if (nextScore > highScore) setHighScore(nextScore);
            return nextScore;
          });

          let newFood;
          do {
            newFood = {
              x: Math.floor(Math.random() * 20),
              y: Math.floor(Math.random() * 10)
            };
          } while (prevSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
          setFood(newFood);

          return [newHead, ...prevSnake];
        } else {
          return [newHead, ...prevSnake.slice(0, -1)];
        }
      });
    };

    const interval = setInterval(gameTick, 180);
    return () => clearInterval(interval);
  }, [gameState, food]);

  const endGame = () => {
    setGameState('cli');
    setHistory(prev => [
      ...prev,
      { type: 'output', text: `GAME OVER! Final Score: ${scoreRef.current}` }
    ]);
  };

  const renderBoard = () => {
    const width = 20;
    const height = 10;
    let boardStr = '╔════════════════════╗\n';

    for (let y = 0; y < height; y++) {
      let row = '║';
      for (let x = 0; x < width; x++) {
        const isHead = snake[0] && snake[0].x === x && snake[0].y === y;
        const isBody = snake.slice(1).some(seg => seg.x === x && seg.y === y);
        const isFood = food.x === x && food.y === y;

        if (isHead) {
          row += 'O';
        } else if (isBody) {
          row += 'o';
        } else if (isFood) {
          row += '★';
        } else {
          row += ' ';
        }
      }
      row += '║\n';
      boardStr += row;
    }

    boardStr += '╚════════════════════╝\n';
    boardStr += `Score: ${score}   High Score: ${highScore}\n`;
    boardStr += `[Arrows] Steer  |  [Q] Exit Game`;
    return boardStr;
  };

  const handleKeyDown = (e) => {
    if (gameState === 'snake') {
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'q', 'escape'].includes(key)) {
        e.preventDefault();

        if ((e.key === 'ArrowUp' || key === 'w') && directionRef.current.y !== 1) {
          setDirection({ x: 0, y: -1 });
        } else if ((e.key === 'ArrowDown' || key === 's') && directionRef.current.y !== -1) {
          setDirection({ x: 0, y: 1 });
        } else if ((e.key === 'ArrowLeft' || key === 'a') && directionRef.current.x !== 1) {
          setDirection({ x: -1, y: 0 });
        } else if ((e.key === 'ArrowRight' || key === 'd') && directionRef.current.x !== -1) {
          setDirection({ x: 1, y: 0 });
        } else if (key === 'q' || e.key === 'Escape') {
          setGameState('cli');
          setHistory(prev => [...prev, { type: 'output', text: 'Snake game quit. Returning to shell.' }]);
        }
      }
      return;
    }

    if (gameState === 'ttt') {
      const key = e.key.toLowerCase();
      if (key === 'q' || e.key === 'Escape') {
        setGameState('cli');
        setHistory(prev => [...prev, { type: 'output', text: 'Tic-Tac-Toe quit. Returning to shell.' }]);
        return;
      }
      if (key >= '1' && key <= '9' && !tttOver) {
        e.preventDefault();
        const idx = parseInt(key) - 1;
        if (tttBoard[idx] === ' ') {
          const nextBoard = [...tttBoard];
          nextBoard[idx] = 'X';
          
          if (checkTttWin(nextBoard, 'X')) {
            setTttBoard(nextBoard);
            setTttStatus('🎉 CONGRATS! You won! Press [Q] to exit.');
            setTttOver(true);
            return;
          }
          
          const empties = nextBoard.filter(v => v === ' ').length;
          if (empties === 0) {
            setTttBoard(nextBoard);
            setTttStatus("🤝 It's a DRAW! Press [Q] to exit.");
            setTttOver(true);
            return;
          }
          
          // AI Move
          const aiIdx = getTttAiMove(nextBoard);
          nextBoard[aiIdx] = 'O';
          
          if (checkTttWin(nextBoard, 'O')) {
            setTttBoard(nextBoard);
            setTttStatus('🤖 AI wins! Better luck next time. Press [Q] to exit.');
            setTttOver(true);
            return;
          }
          
          const nextEmpties = nextBoard.filter(v => v === ' ').length;
          if (nextEmpties === 0) {
            setTttBoard(nextBoard);
            setTttStatus("🤝 It's a DRAW! Press [Q] to exit.");
            setTttOver(true);
            return;
          }
          
          setTttBoard(nextBoard);
        }
      }
      return;
    }

    if (gameState === 'guess' || gameState === 'guess_won') {
      if (e.key === 'Escape') {
        setGameState('cli');
        setHistory(prev => [...prev, { type: 'output', text: 'Guess game quit. Returning to shell.' }]);
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (gameState === 'guess_won') {
          setGameState('cli');
          return;
        }
        const val = inputVal.trim();
        setInputVal('');
        if (val.toLowerCase() === 'q' || val.toLowerCase() === 'quit') {
          setGameState('cli');
          setHistory(prev => [...prev, { type: 'output', text: 'Guess game quit. Returning to shell.' }]);
          return;
        }
        const parsed = parseInt(val);
        if (isNaN(parsed) || parsed < 1 || parsed > 100) {
          setGuessFeedback('⚠️ Please enter a valid number between 1 and 100.');
          return;
        }
        const newAttempts = guessAttempts + 1;
        setGuessAttempts(newAttempts);
        if (parsed === guessTarget) {
          setGuessFeedback(`🎉 CORRECT! The number was ${guessTarget}. You guessed it in ${newAttempts} attempts!`);
          setGameState('guess_won');
          setHistory(prev => [...prev, { type: 'output', text: `Completed Guess Game in ${newAttempts} attempts.` }]);
        } else if (parsed < guessTarget) {
          setGuessFeedback(`📈 Too LOW! Try a number higher than ${parsed}.`);
        } else {
          setGuessFeedback(`📉 Too HIGH! Try a number lower than ${parsed}.`);
        }
      }
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const val = inputVal.trim().toLowerCase();
      if (!val) return;

      const commands = ['help', 'about', 'projects', 'skills', 'clear', 'theme', 'neofetch', 'matrix', 'snake', 'play', 'ttt', 'guess', 'tictactoe'];
      const matches = commands.filter(c => c.startsWith(val));
      if (matches.length > 0) {
        setInputVal(matches[0]);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIdx = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIdx);
      setInputVal(commandHistory[nextIdx]);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIdx = historyIndex + 1;
      if (nextIdx >= commandHistory.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[nextIdx]);
      }
      return;
    }

    if (e.key === 'Enter') {
      const cmdText = inputVal.trim();
      setInputVal('');
      if (!cmdText) return;

      setCommandHistory(prev => {
        if (prev[prev.length - 1] === cmdText) return prev;
        return [...prev, cmdText];
      });
      setHistoryIndex(-1);

      const args = cmdText.split(' ');
      const command = args[0].toLowerCase();

      const newHistory = [...history, { type: 'input', text: `destopianpirate@iitgn:~$ ${cmdText}` }];

      switch (command) {
        case 'help':
          newHistory.push({
            type: 'output',
            text: `Available commands:
  help      - Show this documentation
  about     - Display personal biography summary
  projects  - List featured engineering repositories
  skills    - List core skill categories and proficiencies
  theme     - Switch UI theme (e.g. 'theme light', 'theme dark')
  matrix    - Toggle falling code Matrix digital rain overlay
  neofetch  - Display system specifications and ASCII logo
  snake     - Play the classic preformatted ASCII snake game
  play      - Shortcut to start the snake game
  ttt       - Play interactive Tic-Tac-Toe vs Smart Bot (keys 1-9)
  guess     - Play Guess the Number (1-100) challenge game
  clear     - Reset the terminal output logs`
          });
          break;

        case 'clear':
          setHistory([]);
          return;

        case 'about':
          newHistory.push({
            type: 'output',
            text: `Biography:
Ayush Singh enters academic study at IIT Gandhinagar (Class of 2025) pursuing B.Tech in Artificial Intelligence.
Engaged in bridging low-latency deep learning models (YOLOv8, Custom CNNs) with highly responsive web applications.
Currently looking for research initiatives in CV edge pipelines and scalable AI portals.`
          });
          break;

        case 'projects':
          newHistory.push({
            type: 'output',
            text: `Featured Repositories:
  1. AcadX (student_portal) - React, Vite, Framer Motion, AI Study Companion
  2. AssignmentAI - OCR Vision solver, Client PDF export, AI tutor chat
  3. IoT Dashboard - WebSockets/MQTT, sensor telemetry, active alerts
  4. RoadGuard AI - YOLOv8, GPS coordinate mapper, Google Maps API
  5. ZeroGPTi - NLP sentence grading scales, AI content highlighter
  6. ImagePress - Image Compressor - Flask media optimization pipeline`
          });
          break;

        case 'skills':
          newHistory.push({
            type: 'output',
            text: `Core Skill Sets:
  • Programming Languages    - Python, JavaScript, TypeScript, C++
  • Frontend Development     - React, Next.js, HTML5/CSS3, Framer Motion
  • Backend & Systems        - Node.js, Django, Flask, Express
  • Databases & Cloud        - MongoDB, Firebase, Docker, GCP`
          });
          break;

        case 'theme':
          const targetTheme = args[1] ? args[1].toLowerCase() : null;
          if (targetTheme === 'light' || targetTheme === 'dark') {
            if (targetTheme !== theme) {
              toggleTheme();
            }
            newHistory.push({ type: 'output', text: `System theme adjusted to: ${targetTheme} mode` });
          } else {
            newHistory.push({ type: 'output', text: `Usage: theme [light | dark]. Current theme is: ${theme}` });
          }
          break;

        case 'matrix':
          setMatrixActive(prev => !prev);
          newHistory.push({ type: 'output', text: `Matrix code rain overlay: ${!matrixActive ? 'ENABLED' : 'DISABLED'}` });
          break;

        case 'neofetch':
          newHistory.push({
            type: 'neofetch',
            text: ''
          });
          break;

        case 'snake':
        case 'play':
          setSnake([{ x: 10, y: 5 }]);
          setFood({ x: 5, y: 3 });
          setDirection({ x: 1, y: 0 });
          setScore(0);
          setGameState('snake');
          newHistory.push({ type: 'output', text: 'Initiating Snake Game Engine v1.0.0...' });
          break;

        case 'ttt':
        case 'tictactoe':
          setTttBoard(Array(9).fill(' '));
          setTttStatus('Your turn (X). Press keys 1-9 to place, or [Q] to quit:');
          setTttOver(false);
          setGameState('ttt');
          newHistory.push({ type: 'output', text: 'Initiating Tic-Tac-Toe Game Engine v1.0.0...' });
          break;

        case 'guess':
          const targetNum = Math.floor(Math.random() * 100) + 1;
          setGuessTarget(targetNum);
          setGuessAttempts(0);
          setGuessFeedback('I am thinking of a number between 1 and 100. Guess it!');
          setGameState('guess');
          newHistory.push({ type: 'output', text: 'Initiating Guess the Number Game Engine v1.0.0...' });
          break;

        default:
          newHistory.push({
            type: 'output',
            text: `bash: command not found: ${command}. Type 'help' for valid command lists.`
          });
      }

      setHistory(newHistory);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`cli-terminal-drawer ${isOpen ? 'open' : ''}`}>
      <div className="cli-header">
        <div className="cli-title-wrapper">
          <Terminal size={14} />
          <span>destopianpirate@iitgn:~</span>
        </div>
        <button className="cli-close-btn" onClick={onClose} title="Close Console">
          <span style={{ fontSize: '1.2rem', fontWeight: 'bold', lineHeight: 1 }}>&times;</span>
        </button>
      </div>

      <div className="cli-body" ref={bodyRef} onClick={() => inputRef.current?.focus()} style={{ cursor: 'text' }}>
        {matrixActive && <canvas ref={canvasRef} className="cli-matrix-canvas" />}

        <div className="cli-contents">
          {history.map((line, idx) => {
            if (line.type === 'welcome') {
              return <div key={idx} className="cli-line cli-welcome">{line.text}</div>;
            }
            if (line.type === 'input') {
              return <div key={idx} className="cli-line cli-prompt-line">{line.text}</div>;
            }
            if (line.type === 'neofetch') {
              return (
                <div key={idx} className="cli-neofetch-grid">
                  <div className="cli-ascii">
                    {`   _
  ( )
   H
  / \\
 |---|
 |   |
 |   |
  \\_/`}
                  </div>
                  <div className="neofetch-info">
                    <div><span className="neofetch-field">ayush@destopianpirate</span></div>
                    <div>---------------------</div>
                    <div><span className="neofetch-field">OS: </span><span>destopianOS v1.0.0</span></div>
                    <div><span className="neofetch-field">Host: </span><span>IITGN AI Studio Sandbox</span></div>
                    <div><span className="neofetch-field">Kernel: </span><span>React 19.2 + Vite</span></div>
                    <div><span className="neofetch-field">Uptime: </span><span>13m (running dev server)</span></div>
                    <div><span className="neofetch-field">Shell: </span><span>destopian-cli-shell</span></div>
                    <div><span className="neofetch-field">Theme: </span><span>{theme === 'dark' ? 'Dark Mode (Active)' : 'Light Mode (Active)'}</span></div>
                    <div><span className="neofetch-field">CPU: </span><span>Edge YOLOv8 Engine</span></div>
                  </div>
                </div>
              );
            }
            return <div key={idx} className="cli-line cli-output-text">{line.text}</div>;
          })}

          {gameState !== 'cli' ? (
            <div className="cli-game-container" style={{ position: 'relative' }}>
              {gameState === 'snake' && <pre className="cli-game-board">{renderBoard()}</pre>}
              {gameState === 'ttt' && <pre className="cli-game-board">{renderTttBoard()}</pre>}
              {(gameState === 'guess' || gameState === 'guess_won') && (
                <div className="cli-game-board">
                  <pre style={{ fontFamily: 'inherit', margin: 0, whiteSpace: 'pre-wrap' }}>{renderGuessGame()}</pre>
                  {gameState === 'guess' && (
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem', color: '#4ade80' }}>
                      <span style={{ marginRight: '0.5rem', fontFamily: 'monospace' }}>Guess:</span>
                      <input
                        ref={inputRef}
                        type="text"
                        className="cli-input"
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{ border: 'none', background: 'transparent', outline: 'none', color: '#e2e8f0', flexGrow: 1, fontFamily: 'monospace' }}
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              )}
              {gameState !== 'guess' && (
                <input
                  ref={inputRef}
                  type="text"
                  className="cli-hidden-input"
                  onKeyDown={handleKeyDown}
                  style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                  autoFocus
                />
              )}
            </div>
          ) : (
            <div className="cli-prompt-line">
              <span>destopianpirate@iitgn:~$</span>
              <input
                ref={inputRef}
                type="text"
                className="cli-input"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
