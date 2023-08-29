import { TRANSPARENT } from "./SidePanel";

export const drawArrow = (
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  t = 0.9
) => {
  const arrow = {
    dx: x2 - x1,
    dy: y2 - y1,
  };
  const middle = {
    x: arrow.dx * t + x1,
    y: arrow.dy * t + y1,
  };
  const tip = {
    dx: x2 - middle.x,
    dy: y2 - middle.y,
  };
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.lineTo(middle.x + 0.5 * tip.dy, middle.y - 0.5 * tip.dx);
  context.moveTo(x2, y2);
  context.lineTo(middle.x - 0.5 * tip.dy, middle.y + 0.5 * tip.dx);
  context.closePath();
  context.stroke();
};

export const drawTriangle = (
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  context.beginPath(); // why we need 2 begin path
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.lineTo(x1 * 2 - x2, y2);
  context.closePath();
};

export const drawDiamond = (
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  context.beginPath(); // why we need 2 begin path
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.lineTo(x1, y1 + (y2 - y1) * 2);
  context.lineTo(x1 * 2 - x2, y2);
  context.closePath();
};

export const drawCircle = (
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) => {
  context.beginPath();
  const radius = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  context.arc(x1, y1, radius, 0, 2 * Math.PI);
};

export const drawRectangle = (
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  backgroundColor: string
) => {
  if (backgroundColor === TRANSPARENT) {
    context.strokeRect(x1, y1, x2 - x1, y2 - y1);
  } else {
    context.fillRect(x1, y1, x2 - x1, y2 - y1);
    context.strokeRect(x1, y1, x2 - x1, y2 - y1);
  }
};

export const drawShape = (
  context: CanvasRenderingContext2D,
  backgroundColor: string
) => {
  if (backgroundColor === TRANSPARENT) {
    context.stroke();
  } else {
    context.fill();
    context.stroke();
  }
};

export const drawText = (
  contextRef: React.MutableRefObject<
    CanvasRenderingContext2D | null | undefined
  >,
  x: number,
  y: number,
  value: string,
  textArea: HTMLTextAreaElement,
  width: number,
  color: string,
  isDrawing: { current: boolean } | undefined
) => {
  textArea?.remove();

  const ctx = contextRef.current!;
  if (value) {
    ctx.font = `${
      width * 6
    }px LatoWeb, Helvetica Neue, Helvetica, Arial, sans-serif`;
    ctx.fillStyle = color;

    const lines = value.split("\n");
    for (let i = 0; i < lines.length; i++)
      ctx.fillText(lines[i], x, y + i * width * 5);

    isDrawing!.current = false;
  }
};

export const handleAddText = (
  xCoord: number,
  yCoord: number,
  width: number,
  opacity: number,
  color: string,
  contextRef: React.MutableRefObject<
    CanvasRenderingContext2D | null | undefined
  >,
  isDrawing: { current: boolean } | undefined
) => {
  const textArea = document.createElement("textarea");
  textArea.wrap = "off";
  textArea.dir = "auto";
  textArea.tabIndex = 0;
  textArea.setAttribute(
    "style",
    `
        position: absolute;
        background: transparent;
        left: ${xCoord}px;
        top: ${yCoord - width * 5.5}px;
        opacity: ${opacity / 100};
        color: ${color};
        font-size: ${width * 6}px;
        height: ${width * 10}px;
        max-width: ${window.innerWidth - xCoord}px;
        white-space: pre;
        margin: 0px;
        padding: 0px;
        border: none;
        outline: none;
        resize: none;
        overflow: hidden;
        word-break: normal;
        width: 20px;
        white-space: pre;
        backface-visibility: hidden;
        overflow-wrap: break-word;
        font-family: LatoWeb, Helvetica Neue, Helvetica, Arial, sans-serif;
        box-sizing: content-box;`
  );

  textArea.oninput = () => {
    textArea.style.width = textArea.scrollWidth + "px";
  };

  textArea.onblur = (e) => {
    drawText(
      contextRef,
      xCoord,
      yCoord,
      (e.target as HTMLTextAreaElement).value,
      textArea,
      width,
      color,
      isDrawing
    );
  };
  document.body.appendChild(textArea);
  setTimeout(() => textArea.focus(), 0);
};
