import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ReactNode } from 'react';

interface PanelContainerProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function PanelContainer({ title, children, defaultOpen = true }: PanelContainerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-3 py-1.5 bg-terminal-green/5 border-b border-terminal-green-dark hover:bg-terminal-green/10 transition-colors"
      >
        <span className="text-terminal-green text-xs font-mono font-bold tracking-wider">
          {title}
        </span>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-terminal-dim" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-terminal-dim" />
        )}
      </button>

      {/* Panel Content */}
      <div
        className={`
        flex-1 overflow-auto transition-all duration-200
        ${isOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}
      `}
      >
        {children}
      </div>
    </div>
  );
}

export default PanelContainer;
