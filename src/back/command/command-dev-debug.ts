import { createLoadingWindow, stopLoadingWindow } from "../../window-manager";
import { DebugConfig } from "../models/config.model";
import Command from "./command";

export default class DebugCommand extends Command {
  static label = 'debug';
  static path = '';

  constructor(data: DebugConfig) {
    super('DebugCommand');
    this.caseInsensitive = true;
    this.startsWith = false;

    this.title = "Debug";
    this.keyWord = data.key;
    this.generateId();
  }

  override perform() {
    createLoadingWindow().then(() => {
      setTimeout(() => {
        stopLoadingWindow();
      }, 6000);
    });
  }
}

