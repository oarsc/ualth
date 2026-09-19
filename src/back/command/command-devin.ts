import { FileBlob } from "../../shared-models/models";
import { DevinConfig } from "../models/config.model";
import os from "os";
import fs from "fs";
import path from "path";
import Command from "./command";
import { spawn } from "child_process";
import { createNotificationWindow, createClaudeResponseWindow, createLoadingWindow, stopLoadingWindow } from "../../window-manager";

export default class DevinCommand extends Command {
  static label = 'devin';
  static path = '';

  private env: Record<string, string>;

  constructor(data: DevinConfig) {
    super('DevinCommand');
    this.caseInsensitive = true;
    this.startsWith = false;
    this.requiresParams = true;
    this.keepHistory = false;

    this.title = "Devin query";
    this.keyWord = data.key;
    this.env = data.env || {};
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

    this.openDevinWindowAndSpawn(folder, query)
  }

  private async openDevinWindowAndSpawn(folder: string, query: string) {
    const win = await createClaudeResponseWindow({ title: "Devin", query });

    const result = spawn("devin", ["--respect-workspace-trust", "false", "-p", query],
      {
        cwd: folder,
        stdio: ["ignore", "pipe", "pipe"],
        env: {
          ...process.env,
          ...this.env,
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

    result.on('close', async () => {
      try {
        // Delete sessions from this folder FIRST (while it still exists)
        await this.deleteSessionsFromFolder(folder);
        // Then delete the entire temporary folder
        fs.rmSync(folder, { recursive: true, force: true });
      } catch (err) {
        console.error(`Could not clean up: "${folder}"`, err);
      }
    });

    result.on('error', () => this.error(win));
    result.stderr.on('data', (data) => data ? this.error(win) : null);
  }

  private async deleteSessionsFromFolder(workingDir: string): Promise<void> {
    return new Promise((resolve) => {
      try {
        const lsResult = spawn("devin", ["ls", "--format", "json"], {
          cwd: workingDir,
          stdio: ["ignore", "pipe", "pipe"],
        });

        let output = '';

        lsResult.stdout.on('data', (data: Buffer) => {
          output += data.toString();
        });

        lsResult.on('close', (code: number | null) => {
          if (code === 0 && output) {
            try {
              const sessions = JSON.parse(output);
              if (sessions && sessions.length > 0) {
                // Delete all sessions from this folder and wait for completion
                const deletePromises = sessions.map((session: any) => {
                  const sessionId = session.id || session.session_id;
                  if (sessionId) {
                    return new Promise<void>((deleteResolve) => {
                      const rmResult = spawn("devin", ["rm", "--force", sessionId], {
                        cwd: workingDir,
                        stdio: ["ignore", "pipe", "pipe"],
                      });

                      rmResult.on('close', () => deleteResolve());
                      rmResult.on('error', () => deleteResolve());
                    });
                  } else {
                    return Promise.resolve();
                  }
                });

                Promise.all(deletePromises).then(() => resolve());
              } else {
                resolve();
              }
            } catch (err) {
              resolve();
            }
          } else {
            resolve();
          }
        });

        lsResult.on('error', () => resolve());
      } catch (err) {
        resolve();
      }
    });
  }

  private error(win?: Electron.BrowserWindow) {
    if (win && !win.isDestroyed()) {
      win.webContents.send('claude-response-error', 'An error occurred');
    }
    stopLoadingWindow();
    createNotificationWindow({
      title: "Devin",
      body: "An error occurred",
      severity: "error"
    });
  }

  private createTmpFolder(individualFolder: boolean): string {
    const tmpDir = os.tmpdir();
    const myTempDir = individualFolder
      ? path.join(tmpDir, 'ualth-' + Date.now())
      : path.join(tmpDir, 'ualth-devin');
    fs.mkdirSync(myTempDir, { recursive: true });
    return myTempDir;
  }
}

/*
devin --respect-workspace-trust false -p "What is the capital of France?"

devin -c                              # Resume last session
devin -r abc12345                     # Resume specific session
*/
