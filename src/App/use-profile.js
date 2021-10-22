import { useEffect, useState } from "react";
import firebase from "firebase/app";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocumentData } from "react-firebase-hooks/firestore";
import parser from "ua-parser-js";

export const PROFILE_CREATED = "PROFILE_CREATED";
export const PROFILE_LOADED = "PROFILE_LOADED";
export const CREATE_PROFILE_ERROR = "CREATE_PROFILE_ERROR";

function useProfile(dispatch) {
  const [user, loading, error] = useAuthState(firebase.auth());
  const [profile] = useDocumentData(
    user &&
      user.uid &&
      firebase.firestore().collection("profiles").doc(user.uid),
    { idField: "id" }
  );

  const [creating, setCreating] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (error) {
      dispatch({
        type: CREATE_PROFILE_ERROR,
        error: error.message,
      });
      return;
    }
    if (user) {
      if (!ready) {
        if (creating) {
          const browser = parser(navigator.userAgent);
          delete browser.ua;

          dispatch({
            type: PROFILE_CREATED,
            referrer: document.referrer,
            profile: user.uid,
            ts: new Date().getTime(),
            ref: window.location.pathname.replace("/", ""),
            location: window.__location || null,
            search: window.location.search,
            ...browser,
          });
        } else {
          const browser = parser(navigator.userAgent);
          delete browser.ua;

          dispatch({
            type: PROFILE_LOADED,
            referrer: document.referrer,
            profile: user.uid,
            ts: new Date().getTime(),
            ref: window.location.pathname.replace("/", ""),
            location: window.__location || null,
            search: window.location.search,
            ...browser,
          });
        }
        setReady(true);
      }
    } else {
      if (!creating) {
        firebase.auth().signInAnonymously();
        setCreating(true);
      }
    }
  }, [dispatch, ready, creating, user, profile, loading, error]);

  return profile;
}

export default useProfile;
