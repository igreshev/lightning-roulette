import React, { useReducer, useEffect } from "react";

import MenuItem from "../MenuItem";
import Logo from "../Logo";
import Wheel from "../Wheel";
import Board from "../Board";
import BetSelector from "../BetSelector";
import Actions from "../Actions";
import Info from "../Info";
import Menu from "../Menu";
import Welcome from "./Welcome";
import Display from "../Display";
import { CHIP_VALUES } from "../lib/defs";

import reducer, { addHandler, setDefaults } from "./reducer";

import useSaveState from "./use-save-state";
import useProfile from "./use-profile";
import useDisplayMessages from "./use-display-messages";

import "./styles.scss";

export const TOGGLE_MENU = "TOGGLE_MENU";
export const OPEN_MENU = "OPEN_MENU";
export const CLOSE_MENU = "CLOSE_MENU";
export const SET_BACKGROUND = "SET_BACKGROUND";

export const initialState = {
  balance: 0,
  activeBet: CHIP_VALUES[2], // 10
  currentBet: {},
  betsHistory: [],
  spinDeg: 0,
  ballSpinDeg: 0,
  background: "green"
};

addHandler(TOGGLE_MENU, (action, state) => {
  return {
    activeMenu: !state.activeMenu
  };
});

addHandler(OPEN_MENU, action => {
  return {
    activeMenu: true
  };
});

addHandler(CLOSE_MENU, action => {
  return {
    activeMenu: false
  };
});

addHandler(SET_BACKGROUND, ({ background }) => {
  return {
    background
  };
});

let savedState;

// load initial state from localStore
try {
  savedState = JSON.parse(localStorage.getItem("lrt3"));
} catch (e) {
  console.log("error loading saved state");
}

export const AppContext = React.createContext(initialState);

function App() {
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    ...savedState
  });

  const profile = useProfile(dispatch);
  useSaveState({ ...state });
  useDisplayMessages(dispatch);

  let profileId = profile && profile.id;

  useEffect(() => {
    if (profileId) {
      setDefaults({
        profile: profileId
      });
    }
  }, [profileId]);

  return (
    <AppContext.Provider
      value={{
        ...state,
        ...profile,
        dispatch
      }}
    >
      <Welcome />
      <nav>
        <Logo />
        <MenuItem />
      </nav>
      <div
        className={`app${state.activeMenu ? " active-menu" : ""} ${
          state.background
        }`}
      >
        <Display />
        <Wheel />
        <Info />
        <Board />
        <BetSelector />
        <Actions />
      </div>
      <Menu />
    </AppContext.Provider>
  );
}

export default App;
