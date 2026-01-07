#!/usr/bin/env tsx

/**
 * Test node-pty installation
 * 
 * Run this to diagnose node-pty issues:
 *   tsx scripts/test-node-pty.ts
 */

import * as pty from 'node-pty';
import os from 'os';
import fs from 'fs';

console.log('🔍 Testing node-pty installation...\n');

console.log('System Info:');
console.log(`  Platform: ${os.platform()}`);
console.log(`  Architecture: ${os.arch()}`);
console.log(`  Node version: ${process.version}`);
console.log(`  SHELL env: ${process.env.SHELL || 'not set'}\n`);

// Test shells to try
const testShells = [
  '/bin/zsh',
  '/bin/bash',
  '/bin/sh',
  '/opt/homebrew/bin/zsh',
  '/usr/local/bin/zsh',
];

console.log('Checking shell availability:');
for (const shell of testShells) {
  const exists = fs.existsSync(shell);
  const executable = exists ? (fs.constants.X_OK ? true : false) : false;
  console.log(`  ${shell}: ${exists ? '✅ exists' : '❌ not found'} ${executable ? '(executable)' : ''}`);
}

console.log('\n🧪 Testing node-pty spawn...\n');

let success = false;
let lastError: Error | null = null;

for (const shell of testShells) {
  if (!fs.existsSync(shell)) {
    console.log(`⏭️  Skipping ${shell} (not found)`);
    continue;
  }

  try {
    console.log(`🔄 Trying to spawn: ${shell}`);
    const term = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: process.env.HOME || process.cwd(),
      env: process.env,
    });

    console.log(`✅ SUCCESS! Spawned ${shell}`);
    console.log(`   PID: ${term.pid}`);
    
    // Test writing and reading
    term.write('echo "node-pty works!"\r');
    
    // Wait a bit for output
    setTimeout(() => {
      term.kill();
      console.log(`   ✅ Shell responded correctly\n`);
      success = true;
      process.exit(0);
    }, 500);

    // Listen for output
    term.onData((data) => {
      if (data.includes('node-pty works!')) {
        console.log(`   ✅ Received output: ${data.trim()}`);
      }
    });

    break; // Success, exit
  } catch (error: any) {
    lastError = error;
    console.log(`❌ Failed: ${error.message}`);
    console.log(`   Error code: ${error.code || 'N/A'}`);
    if (error.stack) {
      console.log(`   Stack: ${error.stack.split('\n')[0]}`);
    }
    console.log('');
  }
}

if (!success) {
  console.log('\n❌ All shells failed to spawn!\n');
  console.log('This indicates a problem with node-pty, not the shells.\n');
  console.log('Possible solutions:');
  console.log('1. Rebuild node-pty:');
  console.log('   cd server');
  console.log('   npm rebuild node-pty');
  console.log('');
  console.log('2. Reinstall node-pty:');
  console.log('   cd server');
  console.log('   npm uninstall node-pty');
  console.log('   npm install node-pty');
  console.log('');
  console.log('3. Clean reinstall:');
  console.log('   cd server');
  console.log('   rm -rf node_modules');
  console.log('   npm install');
  console.log('');
  console.log('4. Check build tools (macOS):');
  console.log('   xcode-select --install');
  console.log('');
  
  if (lastError) {
    console.log('Last error details:');
    console.log(`   Message: ${lastError.message}`);
    console.log(`   Code: ${(lastError as any).code || 'N/A'}`);
  }
  
  process.exit(1);
}

