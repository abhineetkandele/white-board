import { useContext, useEffect, useRef } from "react";
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
import { TouchMouseEventType } from "../types/types";
import { createIndexDBConnection, getCords, loadImage } from "../Config/utils";

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
  const [
    { selectedTool, color, backgroundColor, width, strokeStyle, opacity },
    setState,
  ] = useContext(AppContext);

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
  const indexDBRef = useRef<IDBDatabase>();
  const countRef = useRef<number>(0);

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

    const request = createIndexDBConnection("white-board", "data", {
      autoIncrement: true,
    });

    request!.onsuccess = (e) => {
      indexDBRef.current = (e.target as IDBOpenDBRequest).result;

      const tx = indexDBRef.current.transaction("data", "readonly");
      const store = tx.objectStore("data");
      const data = store.getAll();

      data.onsuccess = () => {
        if (data?.result[0]) {
          ctx.putImageData(data.result[0], 0, 0);
        }
      };
    };
  }, []);

  const saveCanvasToDB = () => {
    if (canvasRef.current && contextRef.current) {
      const data = contextRef.current.getImageData(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      const tx = indexDBRef.current!.transaction("data", "readwrite");
      const store = tx.objectStore("data");
      store.clear();
      store.add(data);
    }
  };

  useEffect(() => {
    startingCords.current = undefined;
    const canvas = canvasRef.current!;
    const ctx = contextRef.current!;
    let input: HTMLInputElement;

    const resetSelection = () => setState({ selectedTool: PENCIL });

    const handleLoadedImage = (
      img: HTMLImageElement,
      width: number,
      height: number
    ) => {
      imageDataRef.current = {
        img,
        width,
        height,
      };
      snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };

    const handleInputChange = (e: Event) => {
      loadImage(e, handleLoadedImage);
    };

    if (selectedTool === CLEAR) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      resetSelection();
      saveCanvasToDB();
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

      input.addEventListener("change", handleInputChange);
      input.addEventListener("cancel", resetSelection);
      input.remove();
    }

    return () => {
      input?.removeEventListener("change", handleInputChange);
      input?.removeEventListener("cancel", resetSelection);
    };
  }, [selectedTool, setState]);

  const onPointerDown = (e: TouchMouseEventType) => {
    e.stopPropagation();
    const { xCoord, yCoord } = getCords(e);

    isDrawing.current = true;

    const canvas = canvasRef.current!;
    const ctx = contextRef.current!;

    if (selectedTool === ADD_TEXT) {
      handleAddText(
        xCoord,
        yCoord,
        width,
        opacity,
        color,
        contextRef,
        isDrawing,
        saveCanvasToDB
      );
    }

    ctx.fillStyle = backgroundColor;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = opacity / 100;

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
      ctx.drawImage(img, xCoord, yCoord, width * 3, height * 3);
      setState({ selectedTool: PENCIL });
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
      countRef.current += 1;
      isNewLine.current = false;

      ctx.lineTo(xCoord, yCoord);
      ctx.stroke();
      ctx.save();

      const { x = Infinity, y = Infinity } = startingCords.current || {};
      if (
        Math.abs(x - xCoord) < 10 &&
        Math.abs(y - yCoord) < 10 &&
        countRef.current > 2
      ) {
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        countRef.current = 0;
        isNewLine.current = true;
      }
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
    onPointerMove(e);
  };

  const onPointerMove = (e: TouchMouseEventType) => {
    const { xCoord, yCoord } = getCords(e);

    const ctx = contextRef.current!;

    if (selectedTool === ADD_IMAGE && imageDataRef.current) {
      ctx.putImageData(snapshotRef.current!, 0, 0);

      const { img, width, height } = imageDataRef.current;

      if (img) {
        ctx.globalAlpha = opacity / 100;
        ctx.drawImage(img, xCoord, yCoord, width, height);
      }
      return;
    }

    if (!isDrawing.current) return;

    ctx.putImageData(snapshotRef.current!, 0, 0);
    const { x, y } = startingCords.current!;

    switch (selectedTool) {
      case PENCIL:
      case ERASER:
        if (x === xCoord && y === yCoord) {
          ctx.lineTo(xCoord - 1, yCoord - 1);
        }
        ctx.lineTo(xCoord, yCoord);
        ctx.stroke();
        break;
      case RECTANGLE:
        drawRectangle(ctx, x, y, xCoord, yCoord);
        break;

      case CIRCLE:
        drawCircle(ctx, x, y, xCoord, yCoord);
        drawShape(ctx);
        break;

      case DIAMOND:
        drawDiamond(ctx, x, y, xCoord, yCoord);
        drawShape(ctx);
        break;

      case TRIANGLE:
        drawTriangle(ctx, x, y, xCoord, yCoord);
        drawShape(ctx);
        break;

      case ARROW:
        drawArrow(ctx, x, y, xCoord, yCoord);
        break;

      // case "Add Text": // font family
      // undo redo
      // image size change
      // all content size and position change
      // in mobile content is not visible when drawn but visible when downloaded
      // switching from eraser to image, making it opaque
      // retain aspect ratio of canvas after resizing
      // add theme light and dark
      // check handleWheel for moving canvas
    }
  };

  const onPointerUp = () => {
    isDrawing.current = false;
    saveCanvasToDB();
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerMove={onPointerMove}
      ></canvas>
    </>
  );
};

export default Board;
