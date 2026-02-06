import * as path from "path";
import * as vscode from "vscode";
import * as yaml from "js-yaml";
import { Logger } from "../utils/Logger";

export class BusLibraryService {
  private readonly logger: Logger;
  private cachedDefaultLibrary: any | null = null;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async loadDefaultLibrary(): Promise<any> {
    if (this.cachedDefaultLibrary) {
      return this.cachedDefaultLibrary;
    }

    const defaultPath = await this.findDefaultLibraryPath();
    if (!defaultPath) {
      this.logger.warn("Default bus library not found in workspace");
      return {};
    }

    try {
      const uri = vscode.Uri.file(defaultPath);
      const fileData = await vscode.workspace.fs.readFile(uri);
      const content = Buffer.from(fileData).toString("utf8");
      const parsed = yaml.load(content);

      this.cachedDefaultLibrary = parsed ?? {};
      this.logger.info(`Loaded default bus library from ${defaultPath}`);
      return this.cachedDefaultLibrary;
    } catch (error) {
      this.logger.error(
        `Failed to load default bus library from ${defaultPath}`,
        error as Error,
      );
      return {};
    }
  }

  private async findDefaultLibraryPath(): Promise<string | null> {
    const folders = vscode.workspace.workspaceFolders ?? [];
    if (folders.length === 0) {
      this.logger.warn("No workspace folders found");
      return null;
    }

    for (const folder of folders) {
      let current = folder.uri.fsPath;
      for (let i = 0; i < 6; i += 1) {
        const candidate = path.join(
          current,
          "ipcore_spec",
          "common",
          "bus_definitions.yml",
        );
        if (await this.pathExists(candidate)) {
          return candidate;
        }

        if (path.basename(current) === "ipcore_spec") {
          const insideSpec = path.join(
            current,
            "common",
            "bus_definitions.yml",
          );
          if (await this.pathExists(insideSpec)) {
            return insideSpec;
          }
        }

        const parent = path.dirname(current);
        if (parent === current) {
          break;
        }
        current = parent;
      }
    }

    return null;
  }

  private async pathExists(candidate: string): Promise<boolean> {
    try {
      await vscode.workspace.fs.stat(vscode.Uri.file(candidate));
      return true;
    } catch {
      return false;
    }
  }

  clearCache(): void {
    this.cachedDefaultLibrary = null;
  }
}
