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
      <h4>Formula</h4>
      <p>
        luckyNumber = Math.round(parseInt(crypto.createHmac('sha512',
        seed).update(account + nonce).digest('hex').substr(0, 6), 16) /
        466033.75)
      </p>
      <h4>Support</h4>
      <p>
        <a href={`mailto: ${process.env.REACT_APP_CONTACT_MAIL}`}>
          {process.env.REACT_APP_CONTACT_MAIL}
        </a>
      </p>
      <h4>Backgrounds</h4>
    </div>
  );
}

export default ProvablyFair;
