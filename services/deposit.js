#!/usr/bin/env node

const lnService = require("ln-service");
const event = require("./lib/events");

const admin = require("firebase-admin");
const serviceAccount = require("./lrt3-7deeb-firebase-adminsdk-meinj-ca0e2ccdcf.json");

const config = require("./lnd-config");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lrt3-7deeb.firebaseio.com"
});

const db = admin.firestore();
const { lnd } = lnService.authenticatedLndGrpc(config);

function format(value) {
  return String(value).replace(/000$/, "k");
}

const REQUESTED_INVOICE = "requested";
const PENDING_INVOICE = "pending";
const SETTLED_INVOICE = "settled";

lnService
  .subscribeToInvoices({ lnd })
  .on(
    "invoice_updated",
    async ({ id, is_confirmed, received, tokens, secret }) => {
      // locate invoice
      const querySnap = await db
        .collection("invoices")
        .where("id", "==", id)
        .limit(1)
        .get();

      if (querySnap.empty) return;

      let invoiceSnap = querySnap.docs[0];
      const { state, uid } = invoiceSnap.data();

      if (state === PENDING_INVOICE && is_confirmed && received) {
        await invoiceSnap.ref.update({
          tokens,
          secret,
          state: SETTLED_INVOICE
        });
        const profileSnap = await db
          .collection("profiles")
          .doc(uid)
          .get();
        if (profileSnap.exists) {
          const { balance = 0 } = profileSnap.data();
          await profileSnap.ref.update({
            balance: balance + tokens
          });
        }
        event(db, {
          type: "DEPOSIT",
          profile: uid,
          tokens: format(tokens),
          secret
        });
      }
    }
  );

const processDepositRequests = async () => {
  const querySnap = await db
    .collection("invoices")
    .where("state", "==", REQUESTED_INVOICE)
    .limit(3)
    .get();

  if (querySnap.empty) return;

  for (let invoiceSnap of querySnap.docs) {
    let { amount, uid } = invoiceSnap.data();
    let tokens = Math.round(Number(amount));

    const { request, id } = await lnService.createInvoice({
      lnd,
      description: "https://lightning-roulette.com (deposit)",
      tokens
    });

    // invoice is ready
    await invoiceSnap.ref.update({
      id,
      amount: tokens,
      createdAt: new Date(),
      payment_request: request,
      state: PENDING_INVOICE
    });

    event(db, {
      type: "DEPOSIT_REQUEST",
      profile: uid,
      tokens: format(amount)
    });
  }
};

(async () => {
  do {
    try {
      await processDepositRequests();
    } catch (e) {
      console.log("ERROR", e);
    }
    await new Promise(resolve => setTimeout(resolve, 3000));
  } while (true);
})();
