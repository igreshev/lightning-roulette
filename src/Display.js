import React, { useContext } from "react";
import { black } from "./lib/defs";
import { AppContext } from "./App";
import { addHandler } from "./App/reducer";

export const NUMBER = 1;
export const TEXT = 2;
export const WON_LOST = 3;

export const SHOW_MESSAGE = "SHOW_MESSAGE";

addHandler(SHOW_MESSAGE, ({ message, messageType }) => {
  return {
    message,
    messageType
  };
});

const Text = ({ value = "" }) => {
  const words = String(value).split(" ");
  const dy = words.length > 1 ? 187 : 197;

  return (
    <>
      <circle
        className="text"
        cx="190"
        cy="190"
        r="52"
        strokeWidth="0"
        fill="rgba(0,0,0,0.2)"
      />
      <text
        textAnchor="middle"
        width="380"
        x="190"
        y={dy}
        fontSize="18"
        strokeWidth="0"
      >
        {words[0]}
      </text>
      {words.length > 1 && (
        <text
          textAnchor="middle"
          width="380"
          x="190"
          y={dy + 20}
          fontSize="18"
          strokeWidth="0"
        >
          {words[1]}
        </text>
      )}
    </>
  );
};

const WonLost = ({ value }) => {
  return (
    <>
      <circle
        className="won-lost"
        cx="190"
        cy="190"
        r="52"
        strokeWidth="0"
        fill="rgba(0,0,0,0.2)"
      />
      <text
        textAnchor="middle"
        width="380"
        x="190"
        y="177"
        fontSize="14"
        fontWeight="300"
        strokeWidth="0"
      >
        {value >= 0 ? "YOU WIN" : "YOU LOST"}
      </text>
      <text
        textAnchor="middle"
        width="380"
        x="190"
        y="207"
        fontSize="24"
        strokeWidth="0"
      >
        {Math.abs(value)}
      </text>
    </>
  );
};

const Numeric = ({ value }) => {
  const color = black(value) ? "black" : value === 0 ? "green" : "red";
  return (
    <>
      <circle
        className={`number ${color}`}
        cx="190"
        cy="190"
        r="50"
        strokeWidth="4"
        stroke="#2b2627"
      />
      <text textAnchor="middle" width="380" x="190" y="208" fontSize="45">
        {value}
      </text>
    </>
  );
};

function Display() {
  const { messageType: type, message } = useContext(AppContext);

  let Child = Text;
  if (type === WON_LOST) {
    Child = WonLost;
  }
  if (type === NUMBER) {
    Child = Numeric;
  }

  return (
    <svg className="wheel display" viewBox="0 0 380 380">
      <Child value={message} />
    </svg>
  );
}

export default Display;
