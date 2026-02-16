// Argument parsing utility for terminal commands
// Supports quoted strings with both single and double quotes

/**
 * Parse command arguments respecting quoted strings
 * Examples:
 *   `assign "Melissa Hall" "Mobile App" 100` -> ['assign', 'Melissa Hall', 'Mobile App', '100']
 *   `start product "New Feature"` -> ['start', 'product', 'New Feature']
 *   `staff John` -> ['staff', 'John']
 */
export function parseArgs(input: string): string[] {
  const args: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true;
      quoteChar = char;
    } else if (char === quoteChar && inQuotes) {
      inQuotes = false;
      args.push(current);
      current = '';
      // Skip the space after closing quote if present
      if (input[i + 1] === ' ') {
        i++;
      }
    } else if (char === ' ' && !inQuotes) {
      if (current) {
        args.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }

  if (current) {
    args.push(current);
  }

  return args;
}

/**
 * Test cases for parseArgs:
 * parseArgs('assign "Melissa Hall" "Mobile App" 100')
 *   -> ['assign', 'Melissa Hall', 'Mobile App', '100']
 * parseArgs("start product 'New Feature'")
 *   -> ['start', 'product', 'New Feature']
 * parseArgs('staff John')
 *   -> ['staff', 'John']
 * parseArgs('help')
 *   -> ['help']
 * parseArgs('')
 *   -> []
 */
