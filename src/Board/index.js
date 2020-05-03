import React, { useContext, useState } from "react";
import { black, MAX_BET, sumBet } from "../lib/defs";
import { AppContext } from "../App";
import { addHandler } from "../App/reducer";
import { SHOW_MESSAGE } from "../Display";
import Chip from "../Chip";
import "./styles.scss";

const DISPLAY_VALUES = {
  z1: "1ST 12",
  z2: "2ND 12",
  z3: "3RD 12",
  s: "1-18",
  g: "19-36",
  e: "even",
  o: "odd",
  x1: "2:1",
  x2: "2:1",
  x3: "2:1"
};

export const PLACE_BET = "PLACE_BET";
export const CLEAR_BOARD = "CLEAR_BOARD";
export const DOUBLE_BET = "DOUBLE_BET";
export const QUADRUPLE_BET = "QUADRUPLE_BET";
export const UNDO_BET = "UNDO_BET";

function addHistory(history, bet) {
  history.push(JSON.stringify(bet));
  if (history.length > 25) {
    history.shift();
  }
}

addHandler(PLACE_BET, (action, { betsHistory = [], currentBet = {} }) => {
  addHistory(betsHistory, currentBet);
  const bets = currentBet[action.pos] || [];
  bets.push(action.amount);
  return {
    currentBet: { ...currentBet, [action.pos]: [...bets] },
    betsHistory
  };
});

addHandler(UNDO_BET, (action, { currentBet = {}, betsHistory = [] }) => {
  let prevBet = betsHistory.pop() || "{}";
  return {
    currentBet: JSON.parse(prevBet),
    betsHistory
  };
});

addHandler(CLEAR_BOARD, (action, { betsHistory = [], currentBet = {} }) => {
  addHistory(betsHistory, currentBet);
  return {
    currentBet: {}
  };
});

addHandler(DOUBLE_BET, (action, { betsHistory = [], currentBet = {} }) => {
  const double = {};
  addHistory(betsHistory, currentBet);

  for (const key in currentBet) {
    double[key] = [...currentBet[key], ...currentBet[key]];
  }
  return {
    currentBet: double
  };
});

addHandler(QUADRUPLE_BET, (action, { betsHistory = [], currentBet = {} }) => {
  const quad = {};
  addHistory(betsHistory, currentBet);

  for (const key in currentBet) {
    quad[key] = [
      ...currentBet[key],
      ...currentBet[key],
      ...currentBet[key],
      ...currentBet[key]
    ];
  }
  return {
    currentBet: quad
  };
});

const translate = key => {
  let value = DISPLAY_VALUES[key];
  return value ? value : /\d{1,2}/.test(key) && key.match(/\d{1,2}/)[0];
};

const hover = event => {};
const unhover = event => {};

const createMutateStyle = (top = 0, left = 0, deg = 0) => {
  top = (top * 15).toFixed() + "%";
  left = (left * 15).toFixed() + "%";
  // top = "0%";
  // left = "0%";
  deg = (deg * 50).toFixed();
  return {
    top,
    left,
    transform: `rotate(${deg}deg)`
  };
};

const PlacedChips = ({ values }) => {
  const [noise] = useState(
    Array.from({ length: 3 * 160 }, () => 0.5 - Math.random())
  );
  return (
    <div className="placed-chips">
      {values.slice(-25).map((value, i) => (
        <Chip
          value={value}
          style={createMutateStyle(
            noise[0 + i * 3],
            noise[1 + i * 3],
            noise[2 + i * 3]
          )}
          key={`${i}`}
        />
      ))}
    </div>
  );
};

function Board() {
  const { activeBet, currentBet, dispatch } = useContext(AppContext);

  const placeBet = id => {
    if (sumBet(currentBet) >= MAX_BET) {
      dispatch({
        type: SHOW_MESSAGE,
        message: "TABLE_LIMIT REACHED"
      });
    } else
      dispatch({
        type: PLACE_BET,
        pos: id,
        amount: activeBet
      });
  };

  const bet = id => (
    <div
      id={id}
      style={{ gridArea: id }}
      onMouseEnter={hover}
      onMouseLeave={unhover}
      key={`__${id}`}
      onClick={event => placeBet(event.currentTarget.id)}
    >
      {currentBet[id] ? <PlacedChips values={currentBet[id]} /> : null}
    </div>
  );

  const cell = (n, className, content) => (
    <div
      style={{ gridArea: n }}
      id={n}
      className={className ? className : null}
      key={`__${n}`}
      onMouseEnter={hover}
      onMouseLeave={unhover}
      onClick={event => placeBet(event.currentTarget.id)}
    >
      {content ? content : <span>{translate(n)}</span>}
      {currentBet[n] ? <PlacedChips values={currentBet[n]} /> : null}
    </div>
  );

  return (
    <div className="board-wrap">
      <div className="board">
        {Array.from({ length: 37 }, (v, i) => i).map(n =>
          cell(`n${n}`, black(n) ? "black" : n !== 0 ? "red" : "")
        )}
        {["x1", "x2", "x3"].map(n => cell(n))}
        {["z1", "z2", "z3"].map(n => cell(n))}
        {["s", "e", "o", "g"].map(n => cell(n))}
        {["r", "b"].map(n =>
          cell(
            n,
            "",
            <svg viewBox="0 0 100 50">
              <polygon points="50,0 100,25 50,50 0,25" />
            </svg>
          )
        )}
      </div>
      <div className="streets">
        {Array.from({ length: 12 }, (v, i) => i).map(n => bet(`st${n}`))}
      </div>
      <div className="verts">
        {Array.from({ length: 24 }, (v, i) => i).map(n => bet(`ve${n}`))}
      </div>
      <div className="horiz">
        {Array.from({ length: 36 }, (v, i) => i).map(n => bet(`ho${n}`))}
      </div>
      <div className="squares">
        {Array.from({ length: 24 }, (v, i) => i).map(n => bet(`sq${n}`))}
      </div>
    </div>
  );
}

export default Board;
