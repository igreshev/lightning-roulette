import React, { useContext } from "react";
import { CHIP_VALUES } from "../lib/defs";
import Chip from "../Chip";
import { AppContext } from "../App";
import { addHandler } from "../App/reducer";
import "./styles.scss";

const SET_ACTIVE_BET = "SET_ACTIVE_BET";

addHandler(SET_ACTIVE_BET, action => {
  return {
    activeBet: action.value
  };
});

const BetOption = ({ value }) => {
  const { activeBet, dispatch } = useContext(AppContext);
  return (
    <div
      className={`bet-option${activeBet === value ? " active" : ""}`.trim()}
      onClick={() => {
        dispatch({
          type: SET_ACTIVE_BET,
          value
        });
      }}
    >
      <Chip value={value} />
    </div>
  );
};

function BetSelect() {
  return (
    <div className="bet-select">
      {CHIP_VALUES.map(v => (
        <BetOption value={v} key={v} />
      ))}
    </div>
  );
}

export default BetSelect;
