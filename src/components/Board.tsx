import { useContext, useEffect, useRef } from "react";
import { InitialStateType } from "../types/types";
import { AppContext } from "../context";
import {
  drawArrow,
  drawCircle,
  drawDiamond,
  drawRectangle,
  drawShape,
  drawTriangle,
} from "../Config/canvasUtils";

const Board = () => {
  const {
    setState,
    selectedTool,
    color,
    backgroundColor,
    width,
    strokeStyle,
    opacity,
  }: InitialStateType = useContext(AppContext);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>();
  const isDrawing = useRef(false);
  const isNewLine = useRef(true);
  const startingCords = useRef<{ x: number; y: number }>();
  const snapshotRef = useRef<ImageData>();
  const imageDataRef = useRef<{
    img: HTMLImageElement;
    width: number;
    height: number;
  }>();

  useEffect(() => {
    const canvas = canvasRef.current!;

    const { devicePixelRatio: ratio = 1 } = window;

    canvas.width = canvas?.offsetWidth * ratio;
    canvas.height = canvas?.offsetHeight * ratio;

    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    ctx.scale(ratio, ratio);
    contextRef.current = ctx;

    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = contextRef.current!;
    let input: HTMLInputElement;

    const resetSelection = () => setState!("selectedTool", "Pencil");

    const loadImage = (e: Event) => {
      const img = new Image();
      const target = e.target as HTMLInputElement;

      img.onload = function () {
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;

        const aspectRatio = imgWidth / imgHeight;
        const width = 100;
        const height = width / aspectRatio;

        imageDataRef.current = {
          img,
          width,
          height,
        };
        snapshotRef.current = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
      };
      img.src = URL.createObjectURL(target.files?.[0] as Blob);
    };

    if (selectedTool === "Clear") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      resetSelection();
    } else if (selectedTool === "Download") {
      const link = document.createElement("a");
      link.download = `${Date.now()}.jpg`;
      link.href = canvas.toDataURL();
      link.click();
      resetSelection();
    } else if (selectedTool === "Add Image") {
      input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.click();

      input.addEventListener("change", loadImage);
      input.addEventListener("cancel", resetSelection);
    }

    return () => {
      input?.removeEventListener("change", loadImage);
      input?.removeEventListener("cancel", resetSelection);
    };
  }, [selectedTool, setState]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    isDrawing.current = true;

    const canvas = canvasRef.current!;
    const ctx = contextRef.current!;

    if (selectedTool === "Add Image") {
      ctx.putImageData(snapshotRef.current!, 0, 0);

      const { img, width, height } = imageDataRef.current!;
      ctx.drawImage(img, e.clientX, e.clientY, width, height);
      setState!("selectedTool", "Pencil");
    }

    if (selectedTool !== "Line" || isNewLine.current) {
      startingCords.current = {
        x: e.clientX,
        y: e.clientY,
      };
      ctx.beginPath();
    }

    if (selectedTool === "Line") {
      isNewLine.current = false;
    } else {
      isNewLine.current = true;
    }

    if (selectedTool !== "Eraser") {
      ctx.globalCompositeOperation = "source-over";
    } else {
      ctx.globalCompositeOperation = "destination-out";
    }

    ctx.fillStyle = backgroundColor;
    ctx.strokeStyle = color; // TODO: Need to see stroke opacity
    ctx.lineWidth = +width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = +opacity / 100;

    if (strokeStyle === "Dashed") {
      ctx.setLineDash([10, 15]);
    } else if (strokeStyle === "Dotted") {
      ctx.setLineDash([1, 15]);
    } else {
      ctx.setLineDash([]);
    }

    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    draw(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const ctx = contextRef.current!;

    if (selectedTool === "Add Image") {
      ctx.putImageData(snapshotRef.current!, 0, 0);

      const { img, width, height } = imageDataRef.current!;
      ctx.drawImage(img, e.clientX, e.clientY, width, height);
      return;
    }

    if (!isDrawing.current) return;

    ctx.putImageData(snapshotRef.current!, 0, 0);
    const { x, y } = startingCords.current!;

    switch (selectedTool) {
      case "Line":
      case "Pencil":
      case "Eraser":
        ctx.lineTo(e.clientX, e.clientY);
        ctx.stroke();
        break;

      case "Rectangle":
        // TODO: Need to check for differnt stroke color
        drawRectangle(ctx, x, y, e.clientX, e.clientY, backgroundColor);
        break;

      case "Circle":
        drawCircle(ctx, x, y, e.clientX, e.clientY);
        drawShape(ctx, backgroundColor);
        break;

      case "Diamond":
        drawDiamond(ctx, x, y, e.clientX, e.clientY);
        drawShape(ctx, backgroundColor);
        break;

      case "Triangle":
        drawTriangle(ctx, x, y, e.clientX, e.clientY);
        drawShape(ctx, backgroundColor);
        break;

      case "Arrow":
        drawArrow(ctx, x, y, e.clientX, e.clientY);
        break;

      // case "Add Text":
      // undo redo
      // remove unwanted options from side panel
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseUp={() => (isDrawing.current = false)}
      onMouseMove={draw}
    ></canvas>
  );
};

export default Board;
