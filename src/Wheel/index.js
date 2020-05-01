import React, { useContext } from "react";
import { AppContext } from "../App";
import { addHandler } from "../App/reducer";
import { WHEEL_NUMBERS, black } from "../lib/defs";
import { TEXT } from "../Display";

import "./styles.scss";

export const DEGREES_PER_SPIN = 3 * 383;
export const SPIN_DURAION_IN_SECONDS = 10;

export const BEGIN_SPIN = "BEGIN_SPIN";
export const BEGIN_BALL_SPIN = "BEGIN_BALL_SPIN";
export const END_SPIN = "END_SPIN";

addHandler(BEGIN_SPIN, (action, { spinDeg }) => {
  spinDeg += DEGREES_PER_SPIN;
  return {
    spinDeg,
    spinning: true
  };
});

addHandler(BEGIN_BALL_SPIN, (action, { ballSpinDeg }) => {
  ballSpinDeg =
    ballSpinDeg -
    (ballSpinDeg % 360) +
    WHEEL_NUMBERS.indexOf(action.luckyNumber) * 9.73 -
    360 * 8;

  return {
    message: "",
    messageType: TEXT,
    ballSpinDeg
  };
});

addHandler(END_SPIN, ({ luckyNumber }) => {
  return {
    luckyNumber,
    spinning: false
  };
});

function Wheel() {
  const { spinDeg, ballSpinDeg } = useContext(AppContext);

  const SIZE = 190;
  const W = 2 * (SIZE * Math.tan(((360 / 37 / 2) * Math.PI) / 180));

  const points = `${(SIZE - W / 2).toFixed(1)},10 ${(SIZE + W / 2).toFixed(
    1
  )},10 ${(SIZE + W / 3).toFixed(1)},79 ${(SIZE - W / 3).toFixed(1)},79`;

  return (
    <svg
      className="wheel base"
      viewBox={`0 0 ${SIZE * 2} ${SIZE * 2}`}
      style={{
        transform: `rotate(${spinDeg}deg)`,
        transitionDuration: `${SPIN_DURAION_IN_SECONDS}s`
      }}
    >
      <g>
        <circle
          strokeWidth="10"
          stroke="black"
          strokeOpacity="0.2"
          fill="transparent"
          cx="190"
          cy="190"
          r="182"
        />
        <circle
          stroke="var(--red-color)"
          fill="transparent"
          strokeWidth="68"
          cx="190"
          cy="190"
          r="146"
        />
        <g>
          <polygon points={points} fill="#3ab64b" />
          {WHEEL_NUMBERS.map((number, i) => {
            if (black(number)) {
              return (
                <polygon
                  key={i}
                  points={points}
                  fill="#2b2627"
                  transform={`rotate(${(i * 9.73).toFixed(1)},190,190)`}
                />
              );
            }
            return null;
          })}
        </g>
        <g>
          {WHEEL_NUMBERS.map((number, i) => {
            return (
              <text
                key={i}
                x={190}
                y={32}
                transform={`rotate(${(i * 9.73).toFixed(1)},190,190)`}
              >
                {number}
              </text>
            );
          })}
        </g>
        <circle
          strokeWidth="25"
          stroke="black"
          strokeOpacity="0.2"
          fill="transparent"
          cx="190"
          cy="190"
          r="116"
        />
      </g>
      <g
        className="ball"
        style={{
          transform: `rotate(${ballSpinDeg}deg)`,
          transformOrigin: "190px 190px",
          transitionDuration: `${SPIN_DURAION_IN_SECONDS / 3}s`
        }}
      >
        <g transform="translate(178,48)">
          <circle opacity=".4" fill="#231F20" cx="13" cy="15" r="13.5" />
          <circle fill="#FFF" cx="13" cy="13" r="12.5" />
          <path
            fill="#D1D3D4"
            d="M20.867 5.825c4.151 4.153 4.153 10.889.002 15.045-4.151 4.155-10.887 4.156-15.039.004-4.153-4.154 3.368-3.368 7.517-7.525 4.152-4.156 3.367-11.678 7.52-7.524z"
          />
          <path
            fill="#FFF"
            d="M23.5 15.5a2 2 0 11-4 0 2 2 0 014 0zm-11.5 3a1.5 1.5 0 11-2.999.001A1.5 1.5 0 0112 18.5z"
          />
          <circle fill="#FFF" cx="18.5" cy="8.5" r="1" />
        </g>
      </g>
    </svg>
  );
}

export default Wheel;
