import { FileBlob } from "../../shared-models/models";
import { ClaudeConfig } from "../models/config.model";
import os from "os";
import fs from "fs";
import path from "path";
import Command from "./command";
import { spawn } from "child_process";
import { createNotificationWindow, createClaudeResponseWindow, createLoadingWindow, stopLoadingWindow } from "../../window-manager";

export default class ClaudeCommand extends Command {
  static label = 'claude';
  static path = '';

  constructor(data: ClaudeConfig) {
    super('ClaudeCommand');
    this.caseInsensitive = true;
    this.startsWith = false;
    this.requiresParams = true;
    this.keepHistory = false;

    this.title = "Claude query";
    this.keyWord = data.key;
    this.generateId();
  }

  override perform(argsList: string[], blobs?: Record<string, FileBlob>) {
    const blobsList = blobs? Object.values(blobs) : [];
    const folder = this.createTmpFolder(blobsList.length > 0);

    for (const blob of blobsList) {
      const filePath = path.join(folder, blob.filename);
      fs.writeFileSync(filePath, Uint8Array.from(Buffer.from(blob.base64, 'base64')));
    }

    const query = Object.entries(blobs || {}).reduce(
      (chain, [key, blob]) => chain.replace(key, `"${blob.filename}"`),
      argsList.join(' ')
    );

    createLoadingWindow();

    this.openClaudeWindowAndSpawn(folder, query)
  }

  private async openClaudeWindowAndSpawn(folder: string, query: string) {
    const win = await createClaudeResponseWindow({ title: "Claude", query });

    const result = spawn("claude", ["--no-session-persistence", "--allowedTools=Read,Grep,Glob", "-p", query],
      {
        cwd: folder,
        stdio: ["ignore", "pipe", "pipe"],
        env: {
          ...process.env,
          HTTP_PROXY: "http://127.0.0.1:9000",
          HTTPS_PROXY: "http://127.0.0.1:9000",
        },
      }
    );

    result.stdout.on('data', (data) => {
      stopLoadingWindow();
      win.webContents.send('claude-response-chunk', `${data}`);
    });

    result.stdout.on('end', () => {
      if (!win.isDestroyed()) {
        win.webContents.send('claude-response-done');
      }
    });

    result.on('close', () => {
      try {
        fs.rmSync(folder, { recursive: true, force: true });
      } catch (err) {
        console.error(`Could not remove temporary directory: "${folder}"`, err);
      }
    });

    result.on('error', () => this.error(win));
    result.stderr.on('data', (data) => data ? this.error(win) : null);
  }

  private error(win?: Electron.BrowserWindow) {
    if (win && !win.isDestroyed()) {
      win.webContents.send('claude-response-error', 'An error occurred');
    }
    stopLoadingWindow();
    createNotificationWindow({
      title: "Claude",
      body: "An error occurred",
      severity: "error"
    });
  }

  private createTmpFolder(individualFolder: boolean): string {
    const tmpDir = os.tmpdir();
    const myTempDir = individualFolder
      ? path.join(tmpDir, 'ualth-' + Date.now())
      : path.join(tmpDir, 'ualth-claude');
    fs.mkdirSync(myTempDir, { recursive: true });
    return myTempDir;
  }
}

/*
claude --no-session-persistence -p "What is the capital of France?"

SESSION=$(claude -p "This is a test for me" --output-format json | jq -r '.session_id' && echo "Session: $SESSION")
claude --resume $SESSION -p "Who is this test for??"
*/
