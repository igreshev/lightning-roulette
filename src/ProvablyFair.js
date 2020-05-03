/*eslint react/jsx-no-target-blank: 0 */

import React, { useContext, useState } from "react";
import { AppContext } from "./App";

function ProvablyFair() {
  const {
    nonce,
    seedHash,
    id,
    prevSeed = "-",
    prevSeedHash = "-"
  } = useContext(AppContext);

  const [disabled, setDisabled] = useState(false);

  return (
    <div className="provably-fair">
      <h3>PROVABLY FAIR BITCOIN ROULETTE</h3>
      <p>
        This LN/BTC Roulette uses a provably fair system. A tool that enables
        you to verify each spin result and make sure you are not being cheated.
      </p>
      <h4>ACCOUNT / NONCE</h4>
      <p>
        {id}
        {" / "}
        {nonce}
      </p>
      <h4>Server seed sha-256 hash</h4>
      <p className="hash">{seedHash}</p>
      <div className="request-new-seed">
        <button
          area-label="Request New Seed"
          disabled={disabled}
          onClick={() => {
            setDisabled(true);
            window
              .fetch(`${process.env.REACT_APP_FUNCTIONS_URL}/seedRequest`, {
                method: "POST",
                body: JSON.stringify({
                  id
                }),
                headers: { "Content-Type": "application/json" }
              })
              .then(r => {
                r.json();
                setDisabled(false);
              })
              .catch(error => {
                setDisabled(false);
              });
          }}
        >
          Request new seed
        </button>
      </div>
      <h4>Previous seed</h4>
      <p className="hash">{prevSeed}</p>
      <h4>Previous seed sha256-hash</h4>
      <p className="hash">{prevSeedHash}</p>
      <a
        href="https://github.com/igreshev/lightning-roulette/blob/416c4d4a180ba09a154b7069a27b8ff5d324c895/src/lib/lucky.js#L20"
        target="_blank"
        rel="noopener"
      >
        <h4>Formula</h4>
      </a>
      <p>
        luckyNumber = Math.round(parseInt(crypto.createHmac('sha512',
        seed).update(account + nonce).digest('hex').substr(0, 6), 16) /
        466033.75)
      </p>
      <a
        href="https://github.com/igreshev/lightning-roulette"
        target="_blank"
        rel="noopener"
      >
        <h4 className="source-code-github">source code on github</h4>
      </a>
      <a href="https://twitter.com/LNRoulette" target="_blank" rel="noopener">
        <h4>Twitter</h4>
      </a>
      <a href={`mailto: ${process.env.REACT_APP_CONTACT_MAIL}`}>
        <h4>Support</h4>
      </a>
      <h4>Backgrounds</h4>
    </div>
  );
}

export default ProvablyFair;
