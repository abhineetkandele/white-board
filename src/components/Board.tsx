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
  handleAddText,
} from "../Config/canvasUtils";
import { TOP_PANEL_OPTIONS } from "../Config/TopPanel";

const {
  RECTANGLE,
  TRIANGLE,
  CIRCLE,
  DIAMOND,
  DOWNLOAD,
  LINE,
  ARROW,
  ADD_IMAGE,
  ADD_TEXT,
  PENCIL,
  ERASER,
  CLEAR,
} = TOP_PANEL_OPTIONS;

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

    const resetSelection = () => setState!("selectedTool", PENCIL);

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

    if (selectedTool === CLEAR) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      resetSelection();
    } else if (selectedTool === DOWNLOAD) {
      const link = document.createElement("a");
      link.download = `${Date.now()}.jpg`;
      link.href = canvas.toDataURL();
      link.click();
      resetSelection();
      link.remove();
    } else if (selectedTool === ADD_IMAGE) {
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

  const startDrawing = (
    e:
      | React.MouseEvent<HTMLCanvasElement, MouseEvent>
      | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.stopPropagation();
    const xCoord =
      (e as React.MouseEvent<HTMLCanvasElement, MouseEvent>).clientX ||
      (e as React.TouchEvent<HTMLCanvasElement>).changedTouches?.[0].clientX;
    const yCoord =
      (e as React.MouseEvent<HTMLCanvasElement, MouseEvent>).clientY ||
      (e as React.TouchEvent<HTMLCanvasElement>).changedTouches?.[0].clientY;

    isDrawing.current = true;

    const canvas = canvasRef.current!;
    const ctx = contextRef.current!;

    if (selectedTool === ADD_TEXT) {
      handleAddText(
        xCoord,
        yCoord,
        +width,
        +opacity,
        color,
        contextRef,
        isDrawing
      );
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

    if (selectedTool === ADD_IMAGE && imageDataRef.current) {
      ctx.putImageData(snapshotRef.current!, 0, 0);

      const { img, width, height } = imageDataRef.current;
      ctx.drawImage(img, xCoord, yCoord, width, height);
      setState!("selectedTool", PENCIL);
      imageDataRef.current = {
        img: imageDataRef.current!.img,
        width: 0,
        height: 0,
      };
    }

    if (selectedTool !== LINE || isNewLine.current) {
      startingCords.current = {
        x: xCoord,
        y: yCoord,
      };
      ctx.beginPath();
    }

    if (selectedTool === LINE) {
      isNewLine.current = false;
    } else {
      isNewLine.current = true;
    }

    if (selectedTool !== ERASER) {
      ctx.globalCompositeOperation = "source-over";
    } else {
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "destination-out";
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

    if (selectedTool === ADD_IMAGE && imageDataRef.current) {
      ctx.putImageData(snapshotRef.current!, 0, 0);

      const { img, width, height } = imageDataRef.current;

      if (img) {
        ctx.globalAlpha = +opacity / 100;
        ctx.drawImage(img, xCoord, yCoord, width, height);
      }
      return;
    }

    if (!isDrawing.current) return;

    ctx.putImageData(snapshotRef.current!, 0, 0);
    const { x, y } = startingCords.current!;

    switch (selectedTool) {
      case LINE:
      case PENCIL:
      case ERASER:
        ctx.lineTo(xCoord, yCoord);
        ctx.stroke();
        break;

      case RECTANGLE:
        // TODO: Need to check for differnt stroke color
        drawRectangle(ctx, x, y, xCoord, yCoord, backgroundColor);
        break;

      case CIRCLE:
        drawCircle(ctx, x, y, xCoord, yCoord);
        drawShape(ctx, backgroundColor);
        break;

      case DIAMOND:
        drawDiamond(ctx, x, y, xCoord, yCoord);
        drawShape(ctx, backgroundColor);
        break;

      case TRIANGLE:
        drawTriangle(ctx, x, y, xCoord, yCoord);
        drawShape(ctx, backgroundColor);
        break;

      case ARROW:
        drawArrow(ctx, x, y, xCoord, yCoord);
        break;

      // case "Add Text": // font family
      // undo redo
      // image size change
      // all content size and position change
      // in mobile content is not visible when drawn but visible when downloaded
      // when changing canvas size when some element are there, element are losing their aspect ratio
      // switching from eraser to image, making it opaque
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
