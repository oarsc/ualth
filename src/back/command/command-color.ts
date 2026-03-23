import { createCaptureWindow } from "../../window-manager";
import { ColorConfig } from "../models/config.model";
import Command from "./command";
import { desktopCapturer, screen, NativeImage } from "electron";

export default class ColorCommand extends Command {
  static label = 'color';
  static path = '';

  constructor(data: ColorConfig) {
    super('ColorCommand');
    this.caseInsensitive = true;
    this.startsWith = false;

    this.title = "Eyedropper";
    this.keyWord = data.key;
    this.generateId();
  }

  override perform() {
    setTimeout(() => {
      this.captureScreen()
        .then(image => {
          const display = screen.getPrimaryDisplay();
          
          createCaptureWindow(image, display.size.width, display.size.height, () => "");
        });
    }, 50);
  }

  async captureScreen(): Promise<NativeImage> {
    const display = screen.getPrimaryDisplay();
    const scale = display.scaleFactor;

    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: {
        width: display.size.width * scale,
        height: display.size.height * scale
      }
    });

    return sources[0].thumbnail;
  }

  async getPixelColor(x: number, y: number, image: NativeImage) {
    const scale = screen.getPrimaryDisplay().scaleFactor;

    const bitmap = image.toBitmap();

    const { width } = image.getSize();

    const scaledX = Math.floor(x * scale);
    const scaledY = Math.floor(y * scale);

    const index = (scaledY * width + scaledX) * 4;

    return {
      r: bitmap[index],
      g: bitmap[index + 1],
      b: bitmap[index + 2],
      a: bitmap[index + 3]
    };
  }
}

