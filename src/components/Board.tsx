import { useContext, useEffect, useRef } from "react";
import { InitialStateType } from "../types/types";
import { AppContext } from "../context";
import {
  drawArrow,
  drawCircle,
  drawDiamond,
  drawRectangle,
  drawShape,
  drawText,
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
  const textRef = useRef<{
    text: string;
    x: number;
    y: number;
    textArea: HTMLTextAreaElement | null;
  }>();

  useEffect(() => {
    const canvas = canvasRef.current!;

    const { devicePixelRatio: ratio = 1 } = window;

    canvas.width = canvas?.offsetWidth * ratio;
    canvas.height = canvas?.offsetHeight * ratio;

    const ctx = canvas.getContext("2d", {
      willReadFrequently: true, // When we want to read data frequently
      desynchronized: true,
    })!;
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
        const width = 200;
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
      link.remove();
    } else if (selectedTool === "Add Image") {
      input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.click();

      input.addEventListener("change", loadImage);
      input.addEventListener("cancel", resetSelection);
      input.remove();
    }

    return () => {
      input?.removeEventListener("change", loadImage);
      input?.removeEventListener("cancel", resetSelection);
    };
  }, [selectedTool, setState]);

  drawText(contextRef, textRef, width, color, isDrawing);

  if (contextRef.current) {
    snapshotRef.current = contextRef.current.getImageData(
      0,
      0,
      canvasRef.current!.width,
      canvasRef.current!.height
    );
  }

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement, MouseEvent>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const xCoord =
      (e as React.MouseEvent<HTMLCanvasElement, MouseEvent>).clientX ||
      (e as React.TouchEvent<HTMLCanvasElement>).changedTouches?.[0].clientX;
    const yCoord =
      (e as React.MouseEvent<HTMLCanvasElement, MouseEvent>).clientY ||
      (e as React.TouchEvent<HTMLCanvasElement>).changedTouches?.[0].clientY;

    drawText(contextRef, textRef, width, color, isDrawing);

    isDrawing.current = true;

    const canvas = canvasRef.current!;
    const ctx = contextRef.current!;

    if (selectedTool === "Add Text") {
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
        top: ${yCoord - +width * 5.5}px; 
        opacity: ${+opacity / 100}; 
        color: ${color}; 
        font-size: ${+width * 6}px; 
        height: ${+width * 8}px; 
        width: ${window.innerWidth - xCoord}px; 
        white-space: pre; 
        margin: 0px; 
        padding: 0px; 
        border: none; 
        outline: none; 
        resize: none; 
        overflow: hidden; 
        word-break: normal;
        white-space: pre;
        overflow-wrap: break-word;
        font-family: LatoWeb, Helvetica Neue, Helvetica, Arial, sans-serif;
        box-sizing: content-box;`
      );

      textArea.oninput = (e) => {
        textRef.current!.text = (e.target as HTMLTextAreaElement).value;
      };
      document.body.appendChild(textArea);
      textRef.current = {
        text: "",
        x: xCoord,
        y: yCoord,
        textArea,
      };
      setTimeout(() => textArea.focus(), 0);
    }

    if (selectedTool === "Add Image") {
      ctx.putImageData(snapshotRef.current!, 0, 0);

      const { img, width, height } = imageDataRef.current!;
      ctx.drawImage(img, xCoord, yCoord, width, height);
      setState!("selectedTool", "Pencil");
      imageDataRef.current = {
        img: imageDataRef.current!.img,
        width: 0,
        height: 0,
      };
    }

    if (selectedTool !== "Line" || isNewLine.current) {
      startingCords.current = {
        x: xCoord,
        y: yCoord,
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

  const draw = (
    e:
      | React.MouseEvent<HTMLCanvasElement, MouseEvent>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const xCoord =
      (e as React.MouseEvent<HTMLCanvasElement, MouseEvent>).clientX ||
      (e as React.TouchEvent<HTMLCanvasElement>).changedTouches?.[0].clientX;
    const yCoord =
      (e as React.MouseEvent<HTMLCanvasElement, MouseEvent>).clientY ||
      (e as React.TouchEvent<HTMLCanvasElement>).changedTouches?.[0].clientY;

    const ctx = contextRef.current!;

    if (selectedTool === "Add Image") {
      ctx.putImageData(snapshotRef.current!, 0, 0);

      const { img, width, height } = imageDataRef.current!;

      if (img) {
        ctx.drawImage(img, xCoord, yCoord, width, height);
      }
      return;
    }

    if (!isDrawing.current) return;

    ctx.putImageData(snapshotRef.current!, 0, 0);
    const { x, y } = startingCords.current!;

    switch (selectedTool) {
      case "Line":
      case "Pencil":
      case "Eraser":
        ctx.lineTo(xCoord, yCoord);
        ctx.stroke();
        break;

      case "Rectangle":
        // TODO: Need to check for differnt stroke color
        drawRectangle(ctx, x, y, xCoord, yCoord, backgroundColor);
        break;

      case "Circle":
        drawCircle(ctx, x, y, xCoord, yCoord);
        drawShape(ctx, backgroundColor);
        break;

      case "Diamond":
        drawDiamond(ctx, x, y, xCoord, yCoord);
        drawShape(ctx, backgroundColor);
        break;

      case "Triangle":
        drawTriangle(ctx, x, y, xCoord, yCoord);
        drawShape(ctx, backgroundColor);
        break;

      case "Arrow":
        drawArrow(ctx, x, y, xCoord, yCoord);
        break;

      // case "Add Text": // font family // font size // text getting removed when state is changing on click of panels
      // undo redo
      // remove unwanted options from side panel
      // image size change
      // all content size and position change
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={() => (isDrawing.current = false)}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchEnd={() => (isDrawing.current = false)}
        onTouchMove={draw}
      ></canvas>
    </>
  );
};

export default Board;
