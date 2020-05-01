import { useEffect } from "react";

function useSaveState({
  activeBet,
  currentBet,
  betsHistory,
  background,
  readedWelcome
}) {
  return useEffect(() => {
    try {
      localStorage.setItem(
        "lrt3",
        JSON.stringify({
          activeBet,
          currentBet,
          betsHistory,
          background,
          readedWelcome
        })
      );
    } catch (e) {
      console.log("error saving state!");
    }
  }, [activeBet, background, betsHistory, currentBet, readedWelcome]);
}

export default useSaveState;
