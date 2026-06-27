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

// Function to send a command to CDP and wait for its response
function sendCDPCommand(ws, method, params = {}) {
  const id = Math.floor(Math.random() * 1000000);
  return new Promise((resolve, reject) => {
    const listener = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === id) {
        ws.removeEventListener('message', listener);
        if (msg.error) {
          reject(msg.error);
        } else {
          resolve(msg.result);
        }
      }
    };
    ws.addEventListener('message', listener);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function run() {
  console.log('Starting headless Edge...');
  // Launch Edge with debugging port
  const edge = spawn('cmd.exe', [
    '/c', 
    `start msedge --remote-debugging-port=9222 --headless --disable-gpu http://localhost:${PORT}/`
  ]);

  // Wait for Edge to initialize and load the login page
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

  let browserErrors = [];

  ws.onopen = async () => {
    console.log('WebSocket connected. Enabling Console and Runtime domains...');
    ws.send(JSON.stringify({ id: 1, method: 'Console.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Runtime.enable' }));

    try {
      console.log('Simulating admin authentication via page localStorage...');
      
      // We will perform a fetch call in the page context to login as admin, then save keys to localStorage
      const loginScript = `
        fetch('http://localhost:5000/api/auth/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'adminmithrashoppy@gmail.com', password: 'admin123' })
        })
        .then(res => res.json())
        .then(data => {
          if (data.token) {
            localStorage.setItem('mithira_auth_token', data.token);
            localStorage.setItem('mithira_auth_user', JSON.stringify(data.user));
            console.log('Successfully set admin auth token in localStorage!');
          } else {
            console.error('Authentication failed inside browser:', data.message);
          }
        })
        .catch(err => {
          console.error('Browser authentication fetch error:', err.message);
        });
      `;

      await sendCDPCommand(ws, 'Runtime.evaluate', { expression: loginScript });

      // Wait for fetch to resolve
      await delay(2000);

      console.log('Reloading the page to load AdminDashboard with the admin token...');
      await sendCDPCommand(ws, 'Page.reload');

      console.log('Page reloaded. Listening for exceptions and console errors for 6 seconds...');
    } catch (err) {
      console.error('Failed to execute CDP login sequence:', err);
    }
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    
    // Catch console messages
    if (msg.method === 'Console.messageAdded') {
      const message = msg.params.message;
      console.log(`[Browser Console] [${message.level}] ${message.text}`);
      if (message.level === 'error') {
        browserErrors.push(`Console error: ${message.text}`);
      }
    }
    
    // Catch runtime exceptions
    if (msg.method === 'Runtime.exceptionThrown') {
      const exceptionDetails = msg.params.exceptionDetails;
      const description = exceptionDetails.exception ? exceptionDetails.exception.description : 'Unknown Exception';
      console.error(`\n❌ [Browser Runtime Exception]: ${description}\n`);
      browserErrors.push(`Runtime exception: ${description}`);
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
    if (browserErrors.length > 0) {
      console.error('\n❌ Browser test encountered errors during dashboard load.');
      process.exit(1);
    } else {
      console.log('\n✅ Dashboard loaded without any browser console errors or runtime exceptions!');
      process.exit(0);
    }
  });
}

run();
