import React from "react";

import { CHIP_VALUES } from "./lib/defs";

const COLORS = [
  "#357f9c",
  "#aa2f2a",
  "#31ba9c",
  "#d40f83",
  "#412ebc",
  "#2d3b2c",
  "#993cae",
  "#d45c20",
  "#cec440",
  "#2c9e24"
];

const DISPLAY_VALUES = {
  1000: "1K",
  2000: "2K",
  5000: "5K"
};

function Chip({ height, width, value, style }) {
  const color = COLORS[CHIP_VALUES.indexOf(value)] || "black";
  const text = DISPLAY_VALUES[value] || value;
  return (
    <div className="chip" style={style}>
      <svg height={height} width={width} viewBox="0 0 60 60">
        <circle opacity=".3" fill="#231F20" cx="30" cy="31" r="27.5" />
        <circle fill={color} cx="30" cy="30" r="26.5" />
        <g fill="#FFF">
          <path d="M26.348 8h-8.877a22.019 22.019 0 00-7.774 9.637h4.17a20.236 20.236 0 00-2.623 11.082 21.962 21.962 0 017.368-11.082 21.878 21.878 0 016.079-3.456h-8.356A20.336 20.336 0 0126.348 8zM52 26.348v-8.88a22.007 22.007 0 00-9.64-7.772v4.167a20.221 20.221 0 00-11.079-2.618 21.931 21.931 0 0111.079 7.366 21.919 21.919 0 013.459 6.077l.001-8.354A20.365 20.365 0 0152 26.348zM33.652 52h8.877a22.03 22.03 0 007.774-9.637h-4.17a20.237 20.237 0 002.623-11.082 21.958 21.958 0 01-7.368 11.082 21.9 21.9 0 01-6.079 3.455h8.356A20.35 20.35 0 0133.652 52zM8 33.652v8.879a22.003 22.003 0 009.64 7.773v-4.168a20.21 20.21 0 0011.079 2.617 21.93 21.93 0 01-11.079-7.365 21.945 21.945 0 01-3.46-6.076v8.354A20.365 20.365 0 018 33.652z" />
        </g>
        <text
          fill="#FEFEFE"
          x="50%"
          y="50%"
          fontSize="15"
          fontWeight="500"
          textAnchor="middle"
          dy=".33em"
        >
          {text}
        </text>
      </svg>
    </div>
  );
}

export default Chip;
