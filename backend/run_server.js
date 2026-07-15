const { fork } = require('child_process');
const path = require('path');

console.log(`[${new Date().toISOString()}] Starting server wrapper...`);
const child = fork(path.join(__dirname, 'server.js'), [], {
  stdio: ['pipe', 'pipe', 'pipe', 'ipc']
});

child.stdout.on('data', (data) => {
  console.log(`[STDOUT] ${data.toString().trim()}`);
});

child.stderr.on('data', (data) => {
  console.error(`[STDERR] ${data.toString().trim()}`);
});

child.on('error', (err) => {
  console.error(`[ERROR] Child process error:`, err);
});

child.on('exit', (code, signal) => {
  console.log(`[EXIT] Child process exited with code ${code} and signal ${signal}`);
});
