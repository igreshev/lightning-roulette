const functions = require("firebase-functions").region("europe-west1");
const admin = require("firebase-admin");
const cors = require("cors")({
  origin: "https://lightning-roulette.com"
});

const event = require("./lib/events");

const { sha256, generateSeed, calcNumber } = require("./lib/lucky");
const { sumBet, calculateProfit, checkBet } = require("./lib/defs");

if (process.env.FUNCTIONS_EMULATOR) {
  // load config from services....
  const serviceAccount = require("../services/lrt3-7deeb-firebase-adminsdk-meinj-ca0e2ccdcf.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else admin.initializeApp();

const db = admin.firestore();

// create profile record
exports.createProfile = functions.auth.user().onCreate(async user => {
  const seed = generateSeed();
  const seedHash = sha256(seed);

  await db
    .collection("profiles")
    .doc(user.uid)
    .set({
      balance: 0,
      createdAt: new Date(),
      nonce: 1,
      seedHash
    });

  await db
    .collection("seeds")
    .doc(user.uid)
    .set({ seed });
});

const formatNumber = num => {
  if (num >= 0) {
    return `+${num}`;
  } else {
    return `-${Math.abs(num)}`;
  }
};

exports.seedRequest = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(403).send("Forbidden!");
    }

    let newSeedHash;

    try {
      await db.runTransaction(async transaction => {
        const { id } = req.body || {};
        if (!id) throw new Error("account not found");

        let [{ seedHash }, seed] = await Promise.all([
          transaction.get(db.collection("profiles").doc(id)),
          transaction.get(db.collection("seeds").doc(id))
        ]).then(v => [v[0].data(), v[1].get("seed")]);

        // generate new pair
        const newSeed = generateSeed();
        newSeedHash = sha256(newSeed);

        transaction.update(db.collection("seeds").doc(id), {
          seed: newSeed
        });

        transaction.update(db.collection("profiles").doc(id), {
          modifiedAt: new Date(),

          prevSeed: seed,
          prevSeedHash: seedHash,

          seedHash: newSeedHash
        });
      });
    } catch (e) {
      return res.status(500).send({ ...req.body, error: e.message });
    }
    return res.send({ seedHash: newSeedHash });
  });
});

exports.spin = functions.https.onRequest(async (req, res) =>
  cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(403).send("Forbidden!");
    }

    const { id, bet } = req.body || {};

    try {
      await db.runTransaction(async transaction => {
        if (!id) throw new Error("account not found");

        checkBet(bet);

        let betAmount = sumBet(bet);
        if (isNaN(betAmount) || betAmount <= 0) throw new Error("invalid bet");

        let [{ balance = 0, nonce = 0 }, seed] = await Promise.all([
          transaction.get(db.collection("profiles").doc(id)),
          transaction.get(db.collection("seeds").doc(id))
        ]).then(v => [v[0].data(), v[1].get("seed")]);

        if (betAmount > balance) throw new Error("balance is not enough");

        const luckyNumber = calcNumber(`${id}${nonce}`, seed);
        const profit = sumBet(calculateProfit(luckyNumber, bet));

        balance = balance + profit - betAmount;
        nonce = nonce + 1;

        transaction.update(db.collection("profiles").doc(id), {
          balance,
          nonce,
          modifiedAt: new Date()
        });

        event(db, {
          type: "SPIN",
          profile: id,
          bet,
          luckyNumber,
          profit: formatNumber(profit - betAmount),
          balance,
          nonce
        });

        return res.send({ luckyNumber });
      });
    } catch (e) {
      return res.status(500).send({ ...req.body, error: e.message });
    }
  })
);
