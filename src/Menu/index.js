import React, { useContext, useState } from "react";
import { AppContext, TOGGLE_MENU, SET_BACKGROUND } from "../App";
import ProvablyFair from "../ProvablyFair";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { QRCode } from "react-qr-svg";

import firebase from "firebase/app";
import Clipboard from "clipboard";
import depositUsingRedShift from "./redshift";
import { requestProvider } from "webln";

import "./styles.scss";

const REQUESTED_INVOICE = "requested";
const SETTLED_INVOICE = "settled";

const REQUESTED_PAYMENT = "requested";
const CONFIRMED_PAYMENT = "confirmed";
const ERROR_PAYMENT = "error";

const Settled = () => (
  <svg className="settled-deposit" viewBox="0 0 24 24">
    <path
      d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627
         0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.393 7.5l-5.643 5.784-2.644-2.506-1.856
         1.858 4.5 4.364 7.5-7.643-1.857-1.857z"
    />
  </svg>
);

const QR = ({ value = "" }) => (
  <a
    className="payment-request"
    href={`lightning:${value}`}
    target="_blank"
    rel="noopener noreferrer"
  >
    <QRCode bgColor="#FFFFFF" fgColor="#000000" value={value} />
  </a>
);

function validateDepositAmount(amount) {
  const number = Number(amount);
  if (isNaN(number) || number <= 0 || number > 2000000) {
    return false;
  }

  return true;
}

new Clipboard("#copy-payment-request");

function Menu() {
  const {
    dispatch,
    id: uid,
    activeMenu,
    withdrawLock,
    background
  } = useContext(AppContext);

  const [payment_request, setPaymentRequest] = useState("");

  const [depositAmount, setDepositAmount] = useState("");

  const [invoiceId, setInvoiceId] = useState(null);
  const [paymentId, setPaymentId] = useState(null);

  let [invoice] = useDocumentData(
    invoiceId &&
      firebase
        .firestore()
        .collection("invoices")
        .doc(invoiceId)
  );

  let [payment] = useDocumentData(
    paymentId &&
      firebase
        .firestore()
        .collection("payments")
        .doc(paymentId)
  );

  const [webLNRejected, setWebLNRejected] = useState(false);
  const [paymentRequestCopied, setPaymentRequestCopied] = useState(false);

  const addInvoice = async () => {
    const invoiceRef = await firebase
      .firestore()
      .collection("invoices")
      .add({
        amount: Math.round(Number(depositAmount)),
        uid,
        state: REQUESTED_INVOICE
      });
    setInvoiceId(invoiceRef.id);
  };

  const addPayment = async payment_request => {
    const paymentRef = await firebase
      .firestore()
      .collection("payments")
      .add({
        payment_request,
        uid,
        state: REQUESTED_PAYMENT
      });
    setPaymentId(paymentRef.id);
  };

  const clearDeposit = () => {
    setDepositAmount("");
    setInvoiceId(null);
  };

  const clearWithdrawal = () => {
    setPaymentId(null);
    setPaymentRequest("");
    setPaymentRequestCopied(false);
  };

  const validateWithdraw = paymentRequest => {
    if (String(payment_request).length > 0) return true;
    return false;
  };

  const depositDisabled = !validateDepositAmount(depositAmount) || invoiceId;
  const withdrawDisabled =
    paymentId || withdrawLock || !validateWithdraw(payment_request);

  const setBackground = background => event => {
    dispatch({
      type: SET_BACKGROUND,
      background
    });
    dispatch({
      type: TOGGLE_MENU,
      log: false
    });
  };

  return (
    <aside
      className={`menu${activeMenu ? " visible" : ""} ${background}`.trim()}
    >
      <div className="scroll">
        <div className="deposit">
          {invoice && invoice.payment_request ? (
            invoice.state === SETTLED_INVOICE ? (
              <>
                <Settled />
                <ul className="deposit-actions">
                  <li onClick={clearDeposit}>New Deposit</li>
                </ul>
              </>
            ) : (
              <>
                <QR value={invoice.payment_request} />
                <ul className="deposit-actions">
                  <li>
                    <a
                      href={`lightning:${invoice.payment_request}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open in Wallet
                    </a>
                  </li>
                  <li
                    id="copy-payment-request"
                    data-clipboard-text={invoice.payment_request}
                    onClick={() => {
                      setPaymentRequestCopied(true);
                    }}
                  >
                    {`Copy Payment Request to Clipboard${
                      paymentRequestCopied ? " (copied)" : ""
                    }`}
                  </li>
                  <li
                    onClick={() => {
                      depositUsingRedShift(invoice.payment_request);
                    }}
                  >
                    Deposit on-chain
                  </li>
                  <li
                    onClick={async () => {
                      let webln;
                      try {
                        webln = await requestProvider();
                      } catch (err) {}

                      if (!webln) {
                        setWebLNRejected(true);
                      }

                      if (webln) {
                        webln.sendPayment(invoice.payment_request);
                      }
                    }}
                  >
                    {`Deposit using webLN${webLNRejected ? " (rejected)" : ""}`}
                  </li>
                  <li onClick={clearDeposit}>New Deposit</li>
                </ul>
              </>
            )
          ) : (
            <div className="amount">
              <input
                title="Enter amount in satoshis you want to deposit"
                placeholder="amount_in_sats"
                type="text"
                value={depositAmount}
                onChange={e => {
                  setDepositAmount(e.target.value);
                }}
              />
              <button
                aria-label="Deposit satoshis"
                disabled={depositDisabled}
                onClick={() => {
                  if (validateDepositAmount(depositAmount)) {
                    addInvoice();
                  }
                }}
              >
                Deposit
              </button>
            </div>
          )}
        </div>
        <div className="withdraw">
          {payment && payment.state === CONFIRMED_PAYMENT ? (
            <>
              <Settled />
              <ul className="withdrawal-actions">
                <li onClick={clearWithdrawal}>New Withdrawal</li>
              </ul>
            </>
          ) : payment && payment.state === ERROR_PAYMENT ? (
            <>
              <div className="error">{payment.error}</div>
              <ul className="withdrawal-actions">
                <li onClick={clearWithdrawal}>New Withdrawal</li>
              </ul>
            </>
          ) : (
            <>
              <div className="amount">
                <input
                  title="Paste Lightning Network Payment Request here"
                  placeholder="payment_request"
                  value={payment_request}
                  onChange={e => {
                    setPaymentRequest(e.target.value);
                  }}
                />
                <button
                  aria-label="Withdraw satoshis"
                  disabled={withdrawDisabled}
                  onClick={() => {
                    if (validateWithdraw(payment_request))
                      addPayment(payment_request);
                  }}
                >
                  Withdraw
                </button>
              </div>
              <ul className="withdrawal-actions">
                <li
                  onClick={async () => {
                    let webln;
                    try {
                      webln = await requestProvider();
                    } catch (err) {}

                    if (!webln) {
                      setWebLNRejected(true);
                    }

                    if (webln) {
                      let { paymentRequest } = await webln.makeInvoice();
                      addPayment(paymentRequest);
                    }
                  }}
                >
                  Withdrwaw using webLN
                </li>
              </ul>
            </>
          )}
        </div>
        <ProvablyFair />
        <div className="backgrounds">
          <div className="green" onClick={setBackground("green")} />
          <div className="blue" onClick={setBackground("blue")} />
          <div className="purple" onClick={setBackground("purple")} />
        </div>
      </div>
    </aside>
  );
}

export default Menu;
