#!/usr/bin/env node

const lnService = require("ln-service");
const admin = require("firebase-admin");
const serviceAccount = require("./lrt3-7deeb-firebase-adminsdk-meinj-ca0e2ccdcf.json");
const event = require("./lib/events");

const REQUESTED_PAYMENT = "requested";
const CONFIRMED_PAYMENT = "confirmed";
const ERROR_PAYMENT = "error";

const MAX_FEE = 200; // sats
const MIN_FEE_IF_NO_ROUTE = 50;
const WITDHRAW_LOCK_MIN = 5;
const WITDHRAW_LOCK = WITDHRAW_LOCK_MIN * 60 * 1000; // 5 min in miliseconds

const config = require("./lnd-config");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lrt3-7deeb.firebaseio.com",
});

const db = admin.firestore();
const { lnd } = lnService.authenticatedLndGrpc(config);

function format(value) {
  return String(value).replace(/000$/, "k");
}

const processWithdraws = async () => {
  const querySnap = await db
    .collection("payments")
    .where("state", "==", REQUESTED_PAYMENT)
    .limit(1)
    .get();

  if (querySnap.empty) return;

  let paymentSnap = querySnap.docs[0];

  const { uid, payment_request: request } = paymentSnap.data();

  try {
    if (!isNaN(Number(request))) {
      throw new Error("You need to paste Payment request here, not amount!");
    }

    let {
      tokens = 0,
      id,
      destination,
      is_expired,
    } = await lnService.decodePaymentRequest({ lnd, request });

    if (is_expired) {
      throw new Error(`Invoice expired.`);
    }

    await db.runTransaction(
      async (tx) => {
        // load with write lock!
        const profileSnap = await tx.get(db.collection("profiles").doc(uid));

        let {
          balance = 0,
          withdrawLock = false,
          withdrawAt,
        } = profileSnap.data();

        console.log(
          "[attempt]",
          uid,
          format(tokens),
          `(${format(balance)})`,
          id
        );

        if (
          isNaN(balance) ||
          isNaN(tokens) ||
          typeof balance === "string" ||
          tokens <= 0 ||
          balance < tokens
        ) {
          throw new Error(
            `Invoice amount should be less than or equal to ${balance} satoshis.`
          );
        }

        if (tokens > 350000) {
          throw new Error(
            `Invoice amount is too big. max 350k. You can withdraw more times if needed.`
          );
        }

        if (withdrawLock) {
          throw new Error(`Please waith until previous withdraw is settled.`);
        }

        if (withdrawAt && Date.now() < withdrawAt.toMillis() + WITDHRAW_LOCK) {
          throw new Error(
            `You can withdraw once every ${WITDHRAW_LOCK_MIN} minutes.`
          );
          // ok do it!
        }

        // call probe for route  !!!
        const { route } = await lnService.probeForRoute({
          lnd,
          destination,
          tokens,
          max_fee: MAX_FEE,
        });

        // console.log("route", route);

        let routeFee = route ? route.fee : MIN_FEE_IF_NO_ROUTE;
        console.log(routeFee);

        if (tokens + routeFee > balance) {
          throw new Error(
            `Your balance is not enougth to cover the withdraw fee of ${routeFee} sat, try to reduce the withdraw amount`
          );
        }

        const { secret, fee } = await Promise.race([
          new Promise((resolve) => {
            setTimeout(resolve, 1000 * 55, {
              secret: "timeout",
              fee: 0,
            });
          }),
          lnService.pay({
            lnd,
            request,
            max_fee: MAX_FEE,
          }),
        ]);

        // // call withdraw here  !!!
        // const { secret, fee } = await lnService.pay({
        //   lnd,
        //   request,
        //   max_fee: MAX_FEE,
        // });

        balance = balance - tokens - fee;
        tx.update(profileSnap.ref, {
          balance,
          withdrawAt: new Date(),
        });
        tx.update(paymentSnap.ref, {
          updateAt: new Date(),
          state: CONFIRMED_PAYMENT,
          destination,
          tokens,
          id,
          fee,
          secret,
          balance,
        });

        event(db, {
          type: "WITHDRAW",
          profile: uid,
          tokens: format(tokens),
          secret,
          fee,
          balance,
        });
        console.log(
          "[success]",
          uid,
          format(tokens),
          `(${format(balance)})`,
          fee,
          id,
          secret
        );
      },
      { maxAttempts: 1 }
    );
  } catch (e) {
    //
    let error = "Withdraw error";

    if (Array.isArray(e)) {
      error = e[1];
    } else {
      if (e.message) error = e.message;
    }
    console.log("[error]", uid, error);

    event(db, {
      type: "WITHDRAW_ERROR",
      profile: uid,
      error: String(error),
    });

    await paymentSnap.ref.update({
      state: ERROR_PAYMENT,
      error: String(error),
    });
  }
};

(async () => {
  let beginTime;
  do {
    beginTime = Date.now();
    try {
      await processWithdraws();
    } catch (e) {
      console.log("ERROR", e);
      console.log("---", Date.now() - beginTime);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  } while (true);
})();
