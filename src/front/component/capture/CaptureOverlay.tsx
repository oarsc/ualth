import React from 'react';
import './CaptureOverlay.scss';

const ipcRenderer = window.ipcRenderer;

type ColorFormat = 'hex' | 'rgb' | 'hsl';

interface CaptureOverlayProperties {
  imageUrl: string;
}

interface CaptureOverlayState {
  mouseX: number;
  mouseY: number;
  r: number;
  g: number;
  b: number;
  format: ColorFormat;
  ready: boolean;
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

function toRgb(r: number, g: number, b: number): string {
  return `rgb(${r}, ${g}, ${b})`;
}

function toHsl(r: number, g: number, b: number): string {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return `hsl(0, 0%, ${Math.round(l * 100)}%)`;
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

const LOUPE_PIXELS = 11;
const LOUPE_CELL = 10;
const LOUPE_SIZE = LOUPE_PIXELS * LOUPE_CELL;
const LOUPE_OFFSET = 20;

export default class CaptureOverlay extends React.Component<CaptureOverlayProperties, CaptureOverlayState> {

  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenCtx: CanvasRenderingContext2D | null = null;
  private loupeRef = React.createRef<HTMLCanvasElement>();
  private containerRef = React.createRef<HTMLDivElement>();

  constructor(props: CaptureOverlayProperties) {
    super(props);

    this.state = {
      mouseX: 0,
      mouseY: 0,
      r: 0,
      g: 0,
      b: 0,
      format: 'hex',
      ready: false,
    };
  }

  override componentDidMount() {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      this.offscreenCanvas = canvas;
      this.offscreenCtx = ctx;
      this.setState({ ready: true });
    };
    img.src = this.props.imageUrl;

    window.addEventListener('keydown', this.handleKeyDown);
  }

  override componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  samplePixel = (x: number, y: number): { r: number; g: number; b: number } => {
    if (!this.offscreenCtx || !this.offscreenCanvas) return { r: 0, g: 0, b: 0 };
    const dpr = window.devicePixelRatio || 1;
    const sx = Math.floor(x * dpr);
    const sy = Math.floor(y * dpr);
    const data = this.offscreenCtx.getImageData(sx, sy, 1, 1).data;
    return { r: data[0], g: data[1], b: data[2] };
  }

  drawLoupe = (x: number, y: number) => {
    const loupe = this.loupeRef.current;
    if (!loupe || !this.offscreenCtx || !this.offscreenCanvas) return;
    const ctx = loupe.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;
    const half = Math.floor(LOUPE_PIXELS / 2);
    const sx = Math.floor(x * dpr) - half;
    const sy = Math.floor(y * dpr) - half;

    ctx.clearRect(0, 0, LOUPE_SIZE, LOUPE_SIZE);

    for (let py = 0; py < LOUPE_PIXELS; py++) {
      for (let px = 0; px < LOUPE_PIXELS; px++) {
        const data = this.offscreenCtx.getImageData(sx + px, sy + py, 1, 1).data;
        ctx.fillStyle = `rgb(${data[0]},${data[1]},${data[2]})`;
        ctx.fillRect(px * LOUPE_CELL, py * LOUPE_CELL, LOUPE_CELL, LOUPE_CELL);
      }
    }

    const cx = half * LOUPE_CELL;
    const cy = half * LOUPE_CELL;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx, cy, LOUPE_CELL, LOUPE_CELL);
  }

  handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX: x, clientY: y } = e;
    const { r, g, b } = this.samplePixel(x, y);
    this.drawLoupe(x, y);
    this.setState({ mouseX: x, mouseY: y, r, g, b });
  }

  handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const { r, g, b, format } = this.state;
    const colorValue = format === 'hex' ? toHex(r, g, b)
                     : format === 'rgb' ? toRgb(r, g, b)
                     : toHsl(r, g, b);
    ipcRenderer.send('pick-color', colorValue);
  }

  handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      ipcRenderer.send('close-window');
    } else if (e.key === 'f' || e.key === 'F') {
      this.setState(s => ({
        format: s.format === 'hex' ? 'rgb' : s.format === 'rgb' ? 'hsl' : 'hex'
      }));
    }
  }

  colorString = (): string => {
    const { r, g, b, format } = this.state;
    if (format === 'hex') return toHex(r, g, b);
    if (format === 'rgb') return toRgb(r, g, b);
    return toHsl(r, g, b);
  }

  override render(): JSX.Element {
    const { imageUrl } = this.props;
    const { mouseX, mouseY, r, g, b, format, ready } = this.state;

    const loupeLeft = mouseX + LOUPE_OFFSET;
    const loupeTop = mouseY + LOUPE_OFFSET;

    return (
      <div
        ref={ this.containerRef }
        className="capture-overlay"
        onMouseMove={ this.handleMouseMove }
        onClick={ this.handleClick }
        style={{ backgroundImage: `url(${imageUrl})` }}>
        {
          ready && (
            <>
              <canvas
                ref={ this.loupeRef }
                className="capture-overlay__loupe"
                width={ LOUPE_SIZE }
                height={ LOUPE_SIZE }
                style={{ left: loupeLeft, top: loupeTop }} />
              <div
                className="capture-overlay__preview"
                style={{ left: loupeLeft, top: loupeTop + LOUPE_SIZE + 6 }}>
                <div
                  className="capture-overlay__swatch"
                  style={{ background: `rgb(${r},${g},${b})` }} />
                <div className="capture-overlay__color-text">
                  <span className="capture-overlay__format">{ format.toUpperCase() }</span>
                  <span className="capture-overlay__value">{ this.colorString() }</span>
                </div>
              </div>
            </>
          )
        }
      </div>
    );
  }
}
