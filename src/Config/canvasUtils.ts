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
  // eslint-disable-next-line no-case-declarations
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
  if (backgroundColor === "transparent") {
    context.strokeRect(x1, y1, x2 - x1, y2 - y1);
  } else {
    context.fillRect(x1, y1, x2 - x1, y2 - y1);
  }
};

export const drawShape = (
  context: CanvasRenderingContext2D,
  backgroundColor: string
) => {
  if (backgroundColor === "transparent") {
    context.stroke();
  } else {
    context.fill();
  }
};
