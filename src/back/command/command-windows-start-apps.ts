import { homedir } from "os";
import fs from "fs";
import Command from "./command";

import path from "path";
import { app, shell } from "electron";

export default class WindowsStartAppsCommand extends Command {
  static label = 'windowsApps';

  fullPath = '';

  constructor(lnkPath: string) {
    super('WindowsStartAppsCommand');

    this.caseInsensitive = true;
    this.startsWith = false;

    const fileName = path.basename(lnkPath, path.extname(lnkPath));

    this.keyWord = fileName;
    this.title = fileName;
    this.subtitle = "Application"
    this.icon = 'exec';
    this.fullPath = lnkPath;
    this.generateId();

    // Resolve .lnk target and get its icon
    const targetPath = parseLnkTarget(lnkPath);
    if (targetPath && fs.existsSync(targetPath)) {
      app.getFileIcon(targetPath, { size: 'large' })
        .then(icon => this.icon = icon.toDataURL())
        .catch(() => {});
    }
  }

  static override parseDefinitions(data: string): string[] {
    if (process.platform !== 'win32') {
      return [];
    }

    const dir = ((path) => {
      if (path.match(/%appdata%/i)) {
        const appData = process.env.AppData;
        if (!appData) {
          return undefined;
        }
        return path.replace(/%appdata%/i, appData);
      }
      return path;
    })(data.replace('~', homedir()));

    if (!dir || !fs.existsSync(dir)) {
      return [];
    }

    return keepUnique(getAllLinks(dir));
  }

  override perform() {
    shell.openPath(this.fullPath);
  }
}

export function getAllLinks(dir: string): string[] {
  return fs.readdirSync(dir)
    .flatMap(file => {
      const subDir = path.join(dir, file);
      const stat = fs.statSync(subDir);
      return stat.isDirectory()
        ? getAllLinks(subDir)
        : [ subDir ];
    })
    .filter(file => file.endsWith('.lnk'));
}

function keepUnique(dirs: string[]): string[] {
  const fileNames: string[] = [];

  return dirs.filter(dir => {
    const fileName = path.basename(dir);
    if (fileNames.indexOf(fileName) >= 0) {
      return false;
    } else {
      fileNames.push(fileName);
      return true;
    }
  });
}

// Parse Windows .lnk file to extract target path
function parseLnkTarget(lnkPath: string): string | undefined {
  try {
    const buf = fs.readFileSync(lnkPath);

    // Verify header magic: 4C 00 00 00
    if (buf.readUInt32LE(0) !== 0x0000004C) return undefined;

    // Link flags at offset 0x14
    const flags = buf.readUInt32LE(0x14);
    const hasLinkTargetIDList = (flags & 0x01) !== 0;
    const hasLinkInfo = (flags & 0x02) !== 0;

    let offset = 0x4C; // Header size is 76 bytes

    // Skip LinkTargetIDList if present
    if (hasLinkTargetIDList) {
      const idListSize = buf.readUInt16LE(offset);
      offset += 2 + idListSize;
    }

    // Parse LinkInfo if present
    if (hasLinkInfo) {
      /*const linkInfoSize = */ buf.readUInt32LE(offset);
      const linkInfoHeaderSize = buf.readUInt32LE(offset + 4);
      const linkInfoFlags = buf.readUInt32LE(offset + 8);

      const hasVolumeIDAndLocalBasePath = (linkInfoFlags & 0x01) !== 0;

      if (hasVolumeIDAndLocalBasePath) {
        // Check if we have Unicode path (header size >= 0x24)
        if (linkInfoHeaderSize >= 0x24) {
          const localBasePathOffsetUnicode = buf.readUInt32LE(offset + 0x1C);
          if (localBasePathOffsetUnicode > 0) {
            const pathStart = offset + localBasePathOffsetUnicode;
            /*const pathEnd = */ buf.indexOf(0x0000, pathStart);
            // Read as UTF-16LE
            let targetPath = '';
            for (let i = pathStart; i < buf.length - 1; i += 2) {
              const char = buf.readUInt16LE(i);
              if (char === 0) break;
              targetPath += String.fromCharCode(char);
            }
            if (targetPath) return targetPath;
          }
        }

        // Fall back to ANSI path
        const localBasePathOffset = buf.readUInt32LE(offset + 0x10);
        if (localBasePathOffset > 0) {
          const pathStart = offset + localBasePathOffset;
          const pathEnd = buf.indexOf(0x00, pathStart);
          const targetPath = buf.toString('ascii', pathStart, pathEnd);
          if (targetPath) return targetPath;
        }
      }
    }
  } catch {
    // Ignore parse errors
  }
  return undefined;
}