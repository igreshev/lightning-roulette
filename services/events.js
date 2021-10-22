#!/usr/bin/env node

const serviceAccount = require("./lrt3-7deeb-firebase-adminsdk-meinj-ca0e2ccdcf.json");
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://lrt3-7deeb.firebaseio.com",
});

const db = admin.firestore();

const processEvents = async () => {
  const querySnap = await db
    .collection("events")
    .where("state", "==", 0)
    .limit(20)
    .get();

  if (querySnap.empty) return;

  for (let eventSnap of querySnap.docs) {
    console.log(JSON.stringify(eventSnap.data()));
    // eventSnap.ref.delete();
    eventSnap.ref.update({ state: 1 });
  }
};

(async () => {
  do {
    try {
      await processEvents();
    } catch (e) {
      console.log("ERROR", e);
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  } while (true);
})();
