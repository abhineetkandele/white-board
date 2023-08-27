import Line from "../assets/line.svg";
import LineDashed from "../assets/line-dashed.svg";
import LineDotted from "../assets/line-dotted.svg";

const icons = {
  line: Line,
  "line-dashed": LineDashed,
  "line-dotted": LineDotted,
};

export const COLOR_PICKER = "color-picker";

export const sidePanelConfig = [
  {
    id: "color",
    label: "Stroke",
    type: "selector",
    config: [
      {
        color: "#000000",
      },
      {
        color: "#e03131",
      },
      {
        color: "#2f9e44",
      },
      {
        color: "#1971c2",
      },
      {
        color: "#f08c00",
      },
      {},
      {
        color: COLOR_PICKER,
      },
    ],
  },
  {
    id: "backgroundColor",
    label: "Background",
    type: "selector",
    config: [
      {
        color: "transparent",
      },
      {
        color: "#ffc9c9",
      },
      {
        color: "#b2f2bb",
      },
      {
        color: "#a5d8ff",
      },
      {
        color: "#ffec99",
      },
      {},
      {
        color: COLOR_PICKER,
      },
    ],
  },
  {
    id: "width",
    label: "Width",
    type: "range",
    min: 1,
    max: 15,
  },
  {
    id: "strokeStyle",
    label: "Stroke Style",
    type: "selector",
    config: [
      {
        icon: icons["line"],
        title: "Solid",
      },
      {
        icon: icons["line-dashed"],
        title: "Dashed",
      },
      {
        icon: icons["line-dotted"],
        title: "Dotted",
      },
    ],
  },
  {
    id: "opacity",
    label: "Opacity",
    type: "range",
    min: 0,
    max: 100,
  },
];
