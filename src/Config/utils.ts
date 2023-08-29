import {
  MouseEventType,
  TouchEventType,
  TouchMouseEventType,
} from "../types/types";

export const hex2rgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return { r, g, b };
};

export const getCords = (e: TouchMouseEventType) => {
  const xCoord =
    (e as MouseEventType).clientX ||
    (e as TouchEventType).changedTouches?.[0].clientX;
  const yCoord =
    (e as MouseEventType).clientY ||
    (e as TouchEventType).changedTouches?.[0].clientY;

  return { xCoord, yCoord };
};

export const loadImage = (
  e: Event,
  onImageLoad: (img: HTMLImageElement, width: number, height: number) => void
) => {
  const img = new Image();
  const target = e.target as HTMLInputElement;

  img.onload = function () {
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    const aspectRatio = imgWidth / imgHeight;
    const width = 200;
    const height = width / aspectRatio;

    onImageLoad(img, width, height);
  };
  img.src = URL.createObjectURL(target.files?.[0] as Blob);
};
