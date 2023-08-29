import { ReactNode, createContext, useCallback, useState } from "react";
import { InitialStateType } from "./types/types";
import { TRANSPARENT } from "./Config/SidePanel";
import { TOP_PANEL_OPTIONS } from "./Config/TopPanel";

const initialState: InitialStateType = {
  selectedTool: TOP_PANEL_OPTIONS.PENCIL,
  color: "#000000",
  backgroundColor: TRANSPARENT,
  width: "5",
  strokeStyle: "Solid",
  opacity: "100",
};

export const AppContext = createContext(initialState);

export const ContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(initialState);

  const modifiedSetState = useCallback(
    (id: string, value: string | boolean) => {
      setState!((prevState) => ({ ...prevState, [id]: value }));
    },
    []
  );

  return (
    <AppContext.Provider value={{ ...state, setState: modifiedSetState }}>
      {children}
    </AppContext.Provider>
  );
};
