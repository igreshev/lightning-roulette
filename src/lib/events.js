const empty = (value) => {
  return (
    value === "" ||
    value === null ||
    value === undefined ||
    (typeof value !== "boolean" &&
      typeof value !== "number" &&
      Object.keys(value).length === 0)
  );
};

const prune = (obj) => {
  Object.keys(obj).forEach((key) => {
    if (obj[key] && typeof obj[key] === "object" && !empty(obj[key]))
      prune(obj[key]);
    // recurse
    else if (empty(obj[key])) delete obj[key]; // delete
  });
};

function event(db, action) {
  try {
    prune(action);
    prune(action);
  } catch (e) {}

  return db.collection("events").add(Object.assign(action, { state: 0 }));
}

module.exports = event;
