import React from "react";
import { render } from "react-snapshot";
import "./index.scss";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

import firebase from "firebase/app";

import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  appId: process.env.REACT_APP_APP_ID
};

firebase.initializeApp(firebaseConfig);

let mainElement = document.getElementsByTagName("main")[0];

render(<App />, mainElement);

serviceWorker.register();
