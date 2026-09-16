import fs from 'fs';
import { execFileSync } from 'child_process';

const REOPEN_DELAY_MS = 200;

export function listenPipe(pipePath: string, onMessage: (message: string) => void): void {
  ensureFifo(pipePath);
  openAndRead(pipePath, onMessage);
}

function ensureFifo(pipePath: string) {
  if (fs.existsSync(pipePath)) return;

  try {
    execFileSync('mkfifo', [pipePath], {
      stdio: 'ignore',
    });
  } catch (error) {
    console.error(`Couldn't create pipe at ${pipePath}:`, error);
  }
}

function openAndRead(pipePath: string, onMessage: (message: string) => void): void {
  const stream = fs.createReadStream(pipePath, { encoding: 'utf-8' });
  let buffer = '';

  stream.on('data', (chunk: string | Buffer) => {
    buffer += chunk.toString();

    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const message = line.trim();
      if (message) onMessage(message);
    }
  });

  const reopen = () => setTimeout(() => openAndRead(pipePath, onMessage), REOPEN_DELAY_MS);

  // a FIFO emits 'end' once its writer closes; reopen to keep listening for new writers
  stream.on('end', reopen);
  stream.on('error', (error) => {
    console.error(`Error reading pipe at ${pipePath}:`, error);
    reopen();
  });
}
