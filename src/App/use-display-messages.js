import { useEffect } from "react";
import { TEXT } from "../Display";
import { addHandler } from "./reducer";
import { SHOW_MESSAGE } from "../Display";
import { PROFILE_LOADED, PROFILE_CREATED } from "./use-profile";

const showReadyMessage = dispatch => {
  dispatch({
    type: SHOW_MESSAGE,
    messageType: TEXT,
    message: "PLACE BET",
    log: false
  });
};

export default function useDisplayMessages(dispatch) {
  useEffect(() => {
    dispatch({
      type: SHOW_MESSAGE,
      messageType: TEXT,
      message: "LOADING BALANCE",
      log: false
    });
  }, [dispatch]);

  useEffect(() => {
    addHandler(PROFILE_LOADED, () => showReadyMessage(dispatch));
    addHandler(PROFILE_CREATED, () => showReadyMessage(dispatch));
  }, [dispatch]);
}
