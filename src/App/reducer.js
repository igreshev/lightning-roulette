import firebase from "firebase/app";
import event from "../lib/events";

const handlers = [];
const defaults = {};

export function setDefaults(newd) {
  Object.assign(defaults, newd);
}

export function addHandler(type, fn) {
  handlers.push([type, fn]);
}

function reducer(state, action) {
  let changes = {};

  Object.assign(action, defaults);

  for (const [type, fn] of handlers) {
    if (type === action.type) {
      let roundChanges = fn(action, state, changes);
      Object.assign(changes, roundChanges);
    }
  }

  if (action.log !== false) {
    if (process.env.NODE_ENV === "development") {
      console.log(action);
    } else {
      event(firebase.firestore(), action);
    }
  }

  return Object.assign({}, state, changes);
}

export default reducer;
