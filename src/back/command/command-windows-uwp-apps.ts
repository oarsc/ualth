import { execSync, spawn } from "child_process";
import path from "path";
import fs from "fs";
import Command from "./command";

interface UwpApp {
  name: string;
  appId: string;
  iconPath?: string;
}

export default class WindowsUwpAppsCommand extends Command {
  static label = 'windowsUwpApps';

  appId: string;

  constructor(app: UwpApp) {
    super('WindowsUwpAppsCommand');

    this.caseInsensitive = true;
    this.startsWith = false;

    this.keyWord = app.name;
    this.title = app.name;
    this.subtitle = "UWP Application";
    this.icon = app.iconPath || 'exec';
    this.appId = app.appId;
    this.generateId();
  }

  static override parseDefinitions(data: boolean): UwpApp[] {
    if (process.platform !== 'win32' || !data) {
      return [];
    }

    try {
      // Get basic app list
      const output = execSync(
        'powershell.exe -NoProfile -Command "Get-StartApps | ConvertTo-Json"',
        { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
      );

      const apps = JSON.parse(output);
      const appList: Array<{ Name: string; AppID: string }> = Array.isArray(apps) ? apps : [apps];

      // Get package info for icon extraction
      const packageMap = (() => {
        try {
          const pkgOutput = execSync(
            'powershell.exe -NoProfile -Command "Get-AppxPackage | Select-Object PackageFamilyName, InstallLocation | ConvertTo-Json"',
            { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
          );

          return new Map(
            (JSON.parse(pkgOutput) as Array<{ PackageFamilyName: string; InstallLocation: string }>)
              .filter(pkg => pkg.PackageFamilyName && pkg.InstallLocation)
              .map(pkg => [pkg.PackageFamilyName, pkg.InstallLocation])
          );
        } catch {
          // Continue without icons if package enumeration fails
        }
        return new Map<string, string>();
      })();

      return appList
        .filter(app => app.Name && app.AppID)
        .map(app => {
          let iconPath: string | undefined;

          // Try to extract icon for UWP apps (those with ! in AppID)
          const match = app.AppID.match(/^([^!]+)!/);
          if (match) {
            const packageFamilyName = match[1];
            const installLocation = packageMap.get(packageFamilyName);

            if (installLocation) {
              iconPath = findAppIcon(installLocation);
            }
          }

          return {
            name: app.Name,
            appId: app.AppID,
            iconPath
          };
        });
    } catch (error) {
      console.error('Failed to enumerate UWP apps:', error);
      return [];
    }
  }

  override perform() {
    spawn('explorer.exe', [`shell:AppsFolder\\${this.appId}`], { detached: true });
  }
}

function findAppIcon(installLocation: string): string | undefined {
  try {
    const manifestPath = path.join(installLocation, 'AppxManifest.xml');
    if (!fs.existsSync(manifestPath)) return undefined;

    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');

    // Extract logo path from manifest using regex (avoid XML parsing complexity)
    const logoMatch = manifestContent.match(/<Logo>([^<]+)<\/Logo>/);
    if (!logoMatch) return undefined;

    const logoRelPath = logoMatch[1];
    const logoBasePath = path.join(installLocation, logoRelPath);
    const ext = path.extname(logoBasePath);
    const base = logoBasePath.slice(0, -ext.length);

    // Try different scale variants
    const scales = ['.scale-200', '.scale-150', '.scale-125', '.scale-100', ''];
    for (const scale of scales) {
      const scaledPath = `${base}${scale}${ext}`;
      if (fs.existsSync(scaledPath)) {
        return scaledPath;
      }
    }
  } catch {
    // Ignore errors
  }
  return undefined;
}
