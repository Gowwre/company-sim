import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { terminalSound } from '@/utils/terminalSound';

export function GameSetup() {
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  const [bootComplete, setBootComplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const createCompany = useGameStore((state) => state.createCompany);

  useEffect(() => {
    // Boot sequence
    const bootSteps = [
      () => setStep(1),
      () => setStep(2),
      () => setStep(3),
      () => setStep(4),
      () => setStep(5),
      () => {
        setStep(6);
        setBootComplete(true);
        terminalSound.playSuccess();
        setTimeout(() => inputRef.current?.focus(), 100);
      },
    ];

    bootSteps.forEach((fn, i) => {
      setTimeout(fn, (i + 1) * 300);
      if (i < bootSteps.length - 1) {
        setTimeout(() => terminalSound.playKeystroke(), (i + 1) * 300 + 50);
      }
    });
  }, []);

  const validateCompanyName = (name: string): string | null => {
    const trimmed = name.trim();
    if (!trimmed) return 'Company name is required';
    if (trimmed.length < 2) return 'Company name must be at least 2 characters';
    if (trimmed.length > 50) return 'Company name must be 50 characters or less';
    if (!/^[a-zA-Z0-9\s\-_.&]+$/.test(trimmed)) {
      return 'Company name can only contain letters, numbers, spaces, and -_.&';
    }
    return null;
  };

  const handleStart = () => {
    const validationError = validateCompanyName(companyName);
    if (validationError) {
      setError(validationError);
      terminalSound.playError();
      return;
    }
    terminalSound.playSuccess();
    createCompany(companyName.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.length === 1) {
      terminalSound.playKeystroke();
    }
    if (e.key === 'Enter') {
      terminalSound.playEnter();
      handleStart();
    }
  };

  const generateRandomName = () => {
    const prefixes = ['Tech', 'Soft', 'Data', 'Cloud', 'Smart', 'Digi', 'App', 'Code'];
    const suffixes = ['Corp', 'Labs', 'Systems', 'Solutions', 'Works', 'Studio', 'Hub', 'Forge'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const newName = `${prefix}${suffix}`;
    setCompanyName(newName);
    terminalSound.playKeystroke();
  };

  return (
    <div className="crt-container flex items-center justify-center min-h-screen bg-terminal p-4">
      <div className="w-full max-w-2xl screen-flicker">
        {/* Boot Sequence */}
        <div className="font-mono text-sm text-terminal-green space-y-1">
          <div className="text-terminal-dim">{step >= 1 && 'COMPANY SIMULATOR OS v2.0'}</div>
          <div className="text-terminal-dim">
            {step >= 2 && 'Copyright (c) 2026 Terminal Systems Inc.'}
          </div>
          <div className="text-terminal-dim">{step >= 2 && ''}</div>

          <div className="text-terminal-dim">{step >= 3 && 'Initializing core systems...'}</div>
          <div className="text-terminal-green">{step >= 4 && '  ✓ Loading configuration'}</div>
          <div className="text-terminal-green">{step >= 5 && '  ✓ Initializing database'}</div>
          <div className="text-terminal-green">{step >= 5 && '  ✓ Mounting file systems'}</div>

          {bootComplete && (
            <>
              <div className="text-terminal-dim mt-4"></div>

              {/* ASCII Art Logo */}
              <pre className="text-terminal-green text-xs leading-tight mb-6 glow">
                {`
 ██████╗ ██████╗ ███╗   ███╗██████╗  █████╗ ███╗   ██╗██╗   ██╗
██╔════╝██╔═══██╗████╗ ████║██╔══██╗██╔══██╗████╗  ██║╚██╗ ██╔╝
██║     ██║   ██║██╔████╔██║██████╔╝███████║██╔██╗ ██║ ╚████╔╝ 
██║     ██║   ██║██║╚██╔╝██║██╔══██╗██╔══██║██║╚██╗██║  ╚██╔╝  
╚██████╗╚██████╔╝██║ ╚═╝ ██║██████╔╝██║  ██║██║ ╚████║   ██║   
 ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝   
          ███████╗██╗███╗   ███╗██╗   ██╗██╗      █████╗ ████████╗ ██████╗ ██████╗ 
          ██╔════╝██║████╗ ████║██║   ██║██║     ██╔══██╗╚══██╔══╝██╔═══██╗██╔══██╗
          ███████╗██║██╔████╔██║██║   ██║██║     ███████║   ██║   ██║   ██║██████╔╝
          ╚════██║██║██║╚██╔╝██║██║   ██║██║     ██╔══██║   ██║   ██║   ██║██╔══██╗
          ███████║██║██║ ╚═╝ ██║╚██████╔╝███████╗██║  ██║   ██║   ╚██████╔╝██║  ██║
          ╚══════╝╚═╝╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
`}
              </pre>

              <div className="border border-terminal-green-dark p-4 mb-4">
                <div className="text-terminal-amber mb-2">{'>>> COMPANY REGISTRATION'}</div>
                <div className="text-terminal-dim mb-4">
                  Enter your company name to begin operations.
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-terminal-green">{'NAME:'}</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={companyName}
                    onChange={(e) => {
                      setCompanyName(e.target.value);
                      setError('');
                    }}
                    onKeyDown={handleKeyDown}
                    className="terminal-input flex-1 max-w-xs"
                    placeholder="Your Company Name"
                    autoFocus
                  />
                  <button
                    onClick={generateRandomName}
                    className="text-terminal-dim hover:text-terminal-green text-xs px-2 py-1 border border-terminal-green-dark hover:border-terminal-green"
                  >
                    [RANDOM]
                  </button>
                </div>

                {error && <div className="text-terminal-red mb-4">ERROR: {error}</div>}

                <div className="text-terminal-dim text-xs">
                  Requirements: 2-50 characters, alphanumeric with -_.& allowed
                </div>
              </div>

              <div className="border border-terminal-green-dark p-4 mb-4">
                <div className="text-terminal-cyan mb-2">{'INITIAL RESOURCES:'}</div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-terminal-dim">CASH: </span>
                    <span className="text-terminal-green">$100,000</span>
                  </div>
                  <div>
                    <span className="text-terminal-dim">STAFF: </span>
                    <span className="text-terminal-green">1 Founder</span>
                  </div>
                  <div>
                    <span className="text-terminal-dim">REP: </span>
                    <span className="text-terminal-green">50/100</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleStart}
                  disabled={!companyName.trim()}
                  className="text-terminal-green border border-terminal-green px-4 py-2 hover:bg-terminal-green hover:text-terminal disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  [ START COMPANY ]
                </button>
              </div>

              <div className="text-terminal-dim text-xs mt-4">
                Press ENTER to submit | Type your company name above
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameSetup;
