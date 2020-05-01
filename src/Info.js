import React, { useContext, useState } from "react";
import { useCountUp } from "react-countup";
import { sumBet } from "./lib/defs";
import { AppContext } from "./App";

const PaddedNumber = ({ value }) => {
  value = String(value);
  let match = String(value)
    .padStart(7, "0")
    .match(value);
  if (value === "0") {
    match = { index: 6 };
  }
  if (match && match.index) {
    return (
      <p>
        <span className="padded">{"".padStart(match.index, "0")}</span>
        <span>{value}</span>
      </p>
    );
  } else return <p>{value}</p>;
};

function Info() {
  const { balance, currentBet, spinning } = useContext(AppContext);
  const [storedBalance, storeBalance] = useState(0);
  const [storedBet, storeBet] = useState(0);

  const { countUp: countUpBalance, update: updateBalance } = useCountUp({
    end: storedBalance,
    duration: 0.5
    // useEasing: false
  });

  const { countUp: countUpBet, update: updateBet } = useCountUp({
    end: storedBet,
    duration: 0.5
    // useEasing: false
  });

  const currentBetSum = sumBet(currentBet);

  if (storedBet !== currentBetSum) {
    updateBet(currentBetSum);
    storeBet(currentBetSum);
  }
  if (!spinning && storedBalance !== balance) {
    updateBalance(balance);
    storeBalance(balance);
  }

  return (
    <div className="info">
      <div className="balance">
        <h5>Balance</h5>
        <PaddedNumber value={countUpBalance} />
      </div>
      <div className="bet">
        <h5>Bet</h5>
        <PaddedNumber value={countUpBet} />
      </div>
    </div>
  );
}

export default Info;
