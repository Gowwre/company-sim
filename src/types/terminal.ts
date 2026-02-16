export interface Command {
  name: string;
  aliases?: string[];
  description: string;
  usage: string;
  args?: CommandArg[];
  handler: (args: string[], context: CommandContext) => CommandResult | Promise<CommandResult>;
}

export interface CommandArg {
  name: string;
  description: string;
  required?: boolean;
  choices?: string[];
}

export interface CommandContext {
  // Will be populated from game store
  [key: string]: unknown;
}

export interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
  clear?: boolean;
  sound?: 'keystroke' | 'enter' | 'error' | 'success' | 'bell';
}

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system' | 'ascii';
  content: string;
  timestamp: number;
}

export interface TerminalState {
  lines: TerminalLine[];
  history: string[];
  historyIndex: number;
  currentInput: string;
}
