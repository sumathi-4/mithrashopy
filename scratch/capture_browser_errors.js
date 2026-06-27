const { exec, spawn } = require('child_process');
const http = require('http');

const PORT = 5178; // Admin Panel port

async function getCDPTarget() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const targets = JSON.parse(data);
          const pageTarget = targets.find(t => t.type === 'page');
          if (pageTarget && pageTarget.webSocketDebuggerUrl) {
            resolve(pageTarget.webSocketDebuggerUrl);
          } else {
            reject(new Error('No page target found'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Starting headless Edge...');
  // Launch Edge with debugging port
  const edge = spawn('cmd.exe', [
    '/c', 
    `start msedge --remote-debugging-port=9222 --headless --disable-gpu http://localhost:${PORT}/`
  ]);

  // Wait for Edge to initialize and load the page
  await delay(4000);

  let wsUrl;
  try {
    wsUrl = await getCDPTarget();
    console.log('Connected to CDP Target:', wsUrl);
  } catch (err) {
    console.error('Failed to get CDP target. Is Edge running with remote debugging port 9222?', err.message);
    edge.kill();
    process.exit(1);
  }

  // Connect to Chrome DevTools Protocol using native WebSocket
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('WebSocket connected. Enabling Console and Runtime domains...');
    ws.send(JSON.stringify({ id: 1, method: 'Console.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    
    // Catch console messages
    if (msg.method === 'Console.messageAdded') {
      const message = msg.params.message;
      console.log(`[Browser Console] [${message.level}] ${message.text}`);
    }
    
    // Catch runtime exceptions
    if (msg.method === 'Runtime.exceptionThrown') {
      const exceptionDetails = msg.params.exceptionDetails;
      const description = exceptionDetails.exception ? exceptionDetails.exception.description : 'Unknown Exception';
      console.error(`\n❌ [Browser Runtime Exception]: ${description}\n`);
    }
  };

  ws.onerror = (err) => {
    console.error('WebSocket error:', err);
  };

  // Wait 6 seconds to capture any loading console errors
  await delay(6000);

  console.log('Closing WebSocket and Edge...');
  ws.close();
  
  // Kill any running msedge processes
  exec('taskkill /F /IM msedge.exe', () => {
    console.log('Cleaned up Edge processes.');
    process.exit(0);
  });
}

run();
