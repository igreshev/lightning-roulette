/*eslint react/jsx-no-target-blank: 0 */

import React, { useContext } from "react";
import { AppContext, OPEN_MENU } from "./index";
import { addHandler } from "./reducer";

const DISABLE_WELCOME = "DISABLE_WELCOME";
export const SHOW_WELCOME = "SHOW_WELCOME";

addHandler(DISABLE_WELCOME, action => {
  return {
    readedWelcome: true,
    activeWelcome: false
  };
});

addHandler(SHOW_WELCOME, action => {
  return {
    activeWelcome: true
  };
});

function Welcome() {
  const { dispatch, activeWelcome } = useContext(AppContext);

  return (
    <div className={`welcome${activeWelcome ? " active" : ""}`}>
      <div>
        <h2>Bitcoin Roulette</h2>
        <p>
          Roulette is using Bitcoin Lightning Network for Deposits and
          Withdrawals. In order to Spin the Wheel you need to deposit some{" "}
          <u>satoshis</u> to your onsite balance over lightning first. You can
          deposit as low as 1 satoshi (it's about 0.0001 USD) to start with. All
          withdrawals are instant.
        </p>
        <ul>
          <li>
            If you don't know what Bitcoin is{" "}
            <a
              href="https://www.lopp.net/bitcoin-information.html"
              target="_blank"
              rel="noopener"
            >
              check here
            </a>
          </li>
          <li>
            If you don't know what Lightning Network is{" "}
            <a
              href="https://www.lopp.net/lightning-information.html"
              target="_blank"
              rel="noopener"
            >
              check here
            </a>
          </li>
        </ul>

        <br />
        <h5>
          Lightning Roulette uses a provably fair system that allows players to
          check the integrity of every spin and confirm they have not been
          manipulated. It's also{" "}
          <a
            href="https://github.com/igreshev/lightning-roulette"
            target="_blank"
            rel="noopener"
          >
            <b>open source</b>
          </a>
        </h5>
        <br />
        <div>
          <button
            aria-label="I Understand"
            onClick={() => {
              dispatch({
                type: DISABLE_WELCOME,
                action: "go-deposit"
              });
              dispatch({
                type: OPEN_MENU
              });
            }}
          >
            DEPOSIT FUNDS
          </button>
        </div>
        <div>
          <button
            className="skip"
            onClick={() => {
              dispatch({
                type: DISABLE_WELCOME,
                action: "not-now"
              });
            }}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

export default Welcome;
