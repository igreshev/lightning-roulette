import React, { useContext } from "react";
import { AppContext, OPEN_MENU, CLOSE_MENU } from "./App";

function Menu() {
  const { dispatch, activeMenu } = useContext(AppContext);

  return (
    <div
      className="menu"
      onClick={() => {
        dispatch({
          type: activeMenu ? CLOSE_MENU : OPEN_MENU
        });
      }}
    >
      {activeMenu ? (
        <svg viewBox="0 0 21.9 21.9" fill="#FFF">
          <path
            d="M14.1 11.3c-.2-.2-.2-.5 0-.7l7.5-7.5c.2-.2.3-.5.3-.7s-.1-.5-.3-.7L20.2.3c-.2-.2-.5-.3-.7-.3-.3
                   0-.5.1-.7.3l-7.5 7.5c-.2.2-.5.2-.7 0L3.1.3C2.9.1 2.6 0 2.4 0s-.5.1-.7.3L.3 1.7c-.2.2-.3.5-.3.7s.1.5.3.7l7.5 7.5c.2.2.2.5
                   0 .7L.3 18.8c-.2.2-.3.5-.3.7s.1.5.3.7l1.4 1.4c.2.2.5.3.7.3s.5-.1.7-.3l7.5-7.5c.2-.2.5-.2.7 0l7.5
                   7.5c.2.2.5.3.7.3s.5-.1.7-.3l1.4-1.4c.2-.2.3-.5.3-.7s-.1-.5-.3-.7l-7.5-7.5z"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 30 30">
          <path d="M2 6h26v4H2zm0 7h26v4H2zm0 7h26v4H2z" fill="#FFF" />
        </svg>
      )}
    </div>
  );
}

export default Menu;
