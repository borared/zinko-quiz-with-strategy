const { execSync } = require('child_process');
require('dotenv').config();

const PORT = String(process.env.PORT || 5000);

function freePortWindows(port) {
  let output = '';
  try {
    output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
  } catch {
    return;
  }

  const pids = new Set();
  for (const line of output.split('\n')) {
    if (!line.includes('LISTENING')) continue;
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && /^\d+$/.test(pid) && pid !== String(process.pid)) {
      pids.add(pid);
    }
  }

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      console.log(`Freed port ${port} (stopped PID ${pid})`);
    } catch {
      // Process may have already exited.
    }
  }
}

function freePortUnix(port) {
  try {
    execSync(`lsof -ti tcp:${port} | xargs -r kill -9`, { stdio: 'ignore', shell: true });
    console.log(`Freed port ${port}`);
  } catch {
    // Port already free.
  }
}

if (process.platform === 'win32') {
  freePortWindows(PORT);
} else {
  freePortUnix(PORT);
}