import { useState, useRef, useEffect, useCallback } from 'react';
import type { TerminalLine } from '@/types/terminal';
import { findCommand, getSuggestions } from '@/utils/commands';
import { terminalSound } from '@/utils/terminalSound';
import { parseArgs } from '@/utils/parseArgs';

interface TerminalProps {
  initialLines?: TerminalLine[];
  showHeader?: boolean;
}

export function Terminal({ initialLines = [], showHeader = true }: TerminalProps) {
  const [lines, setLines] = useState<TerminalLine[]>(initialLines);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle click anywhere to focus input
  const handleTerminalClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Add line to terminal
  const addLine = useCallback((type: TerminalLine['type'], content: string) => {
    const newLine: TerminalLine = {
      id: crypto.randomUUID(),
      type,
      content,
      timestamp: Date.now(),
    };
    setLines((prev) => [...prev, newLine]);
  }, []);

  // Execute command
  const executeCommand = useCallback(
    async (cmdStr: string) => {
      const trimmed = cmdStr.trim();
      if (!trimmed) return;

      // Add to history
      setHistory((prev) => [trimmed, ...prev].slice(0, 100));
      setHistoryIndex(-1);

      // Add input line
      addLine('input', `> ${trimmed}`);

      // Parse command with quoted string support
      const parts = parseArgs(trimmed);
      const cmdName = parts[0].toLowerCase();
      const args = parts.slice(1);

      // Find command
      const command = findCommand(cmdName);

      if (!command) {
        addLine('error', `Command not found: ${cmdName}\nType 'help' for available commands.`);
        terminalSound.playError();
        return;
      }

      // Execute
      try {
        const result = await command.handler(args, {});

        if (result.clear) {
          setLines([]);
        }

        if (result.output) {
          addLine(result.success ? 'output' : 'error', result.output);
        }

        if (result.error) {
          addLine('error', result.error);
        }

        // Play sound
        switch (result.sound) {
          case 'success':
            terminalSound.playSuccess();
            break;
          case 'error':
            terminalSound.playError();
            break;
          case 'bell':
            terminalSound.playBell();
            break;
          default:
            terminalSound.playEnter();
        }
      } catch (err) {
        addLine('error', `Error executing command: ${err}`);
        terminalSound.playError();
      }
    },
    [addLine]
  );

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    terminalSound.playKeystroke();

    // Update suggestions
    if (value.length > 0) {
      const cmds = getSuggestions(value);
      setSuggestions(cmds);
      setShowSuggestions(cmds.length > 0 && cmds[0] !== value);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Tab completion
    if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setInput(suggestions[0] + ' ');
        setShowSuggestions(false);
        terminalSound.playKeystroke();
      }
      return;
    }

    // Enter
    if (e.key === 'Enter') {
      e.preventDefault();
      setShowSuggestions(false);
      executeCommand(input);
      setInput('');
      return;
    }

    // History navigation
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
        terminalSound.playKeystroke();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
        terminalSound.playKeystroke();
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
        terminalSound.playKeystroke();
      }
      return;
    }

    // Ctrl+C
    if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      addLine('system', '^C');
      setInput('');
      terminalSound.playKeystroke();
      return;
    }

    // Ctrl+L
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
      terminalSound.playKeystroke();
      return;
    }

    // Sound for other keys
    if (e.key.length === 1) {
      terminalSound.playKeystroke();
    }
  };

  // Initial boot sequence
  useEffect(() => {
    if (showHeader && lines.length === 0) {
      const bootLines: TerminalLine[] = [
        {
          id: '1',
          type: 'system',
          content: 'BIOS DATE 02/14/26 14:22:54 VER 1.0.2',
          timestamp: Date.now(),
        },
        {
          id: '2',
          type: 'system',
          content: 'CPU: QUANTUM CORE i9-9900K @ 5.00GHz',
          timestamp: Date.now(),
        },
        { id: '3', type: 'system', content: 'MEM: 65536K OK', timestamp: Date.now() },
        { id: '4', type: 'system', content: '', timestamp: Date.now() },
        {
          id: '5',
          type: 'system',
          content: 'Initializing Company Simulator OS...',
          timestamp: Date.now(),
        },
        { id: '6', type: 'system', content: 'Loading modules...', timestamp: Date.now() },
        { id: '7', type: 'system', content: '  ✓ Employee Management', timestamp: Date.now() },
        { id: '8', type: 'system', content: '  ✓ Financial System', timestamp: Date.now() },
        { id: '9', type: 'system', content: '  ✓ Project Engine', timestamp: Date.now() },
        { id: '10', type: 'system', content: '  ✓ Culture Dynamics', timestamp: Date.now() },
        { id: '11', type: 'system', content: '', timestamp: Date.now() },
        { id: '12', type: 'system', content: 'System ready.', timestamp: Date.now() },
        { id: '13', type: 'system', content: 'Type "help" to begin.', timestamp: Date.now() },
        { id: '14', type: 'system', content: '', timestamp: Date.now() },
      ];
      setLines(bootLines);

      // Play startup sounds
      setTimeout(() => terminalSound.playSuccess(), 100);
    }
  }, [showHeader]);

  return (
    <div
      className="crt-container flex flex-col h-screen w-screen bg-terminal overflow-hidden"
      onClick={handleTerminalClick}
    >
      {/* Status Bar */}
      <div className="flex-none px-4 py-2 border-b border-terminal-green-dark text-terminal-green-dim text-xs flex justify-between items-center glow-dim">
        <span>COMPANY SIMULATOR v2.0</span>
        <span>TERMINAL MODE</span>
        <span>{new Date().toLocaleTimeString()}</span>
      </div>

      {/* Terminal Output */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 terminal-scroll font-mono text-sm screen-flicker"
        style={{ fontFamily: "'JetBrains Mono', 'Consolas', monospace" }}
      >
        {lines.map((line) => (
          <div
            key={line.id}
            className={`whitespace-pre-wrap mb-1 ${
              line.type === 'error'
                ? 'text-terminal-red'
                : line.type === 'system'
                  ? 'text-terminal-dim'
                  : line.type === 'input'
                    ? 'text-terminal-white'
                    : 'text-terminal-green'
            }`}
          >
            {line.content}
          </div>
        ))}

        {/* Input Line */}
        <div className="flex items-center mt-2">
          <span className="text-terminal-green mr-2">{'>'}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="terminal-input flex-1"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <span className="cursor ml-1"></span>
        </div>

        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="mt-2 text-terminal-dim text-xs">
            <span className="text-terminal-amber">Suggestions: </span>
            {suggestions.slice(0, 5).join(', ')}
          </div>
        )}

        {/* Spacer for scrolling */}
        <div className="h-4"></div>
      </div>

      {/* Footer Status */}
      <div className="flex-none px-4 py-1 border-t border-terminal-green-dark text-terminal-green-dark text-xs flex justify-between">
        <span>[F1] Help [Tab] Complete [↑↓] History</span>
        <span>
          Sound: {(terminalSound as any).enabled ? 'ON' : 'OFF'} | Ctrl+L Clear | Ctrl+C Cancel
        </span>
      </div>
    </div>
  );
}

export default Terminal;
