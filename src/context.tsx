import { ReactNode, createContext, useState } from "react";
import { InitialStateType } from "./types/types";

const initialState: InitialStateType = {
  selectedTool: "Pencil",
  color: "#000000",
  backgroundColor: "transparent",
  width: "5",
  strokeStyle: "Solid",
  opacity: "100",
};

export const AppContext = createContext(initialState);

export const ContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(initialState);

  const modifiedSetState = (id: string, value: string | boolean) => {
    setState!({ ...state, [id]: value });
  };

  return (
    <AppContext.Provider value={{ ...state, setState: modifiedSetState }}>
      {children}
    </AppContext.Provider>
  );
};
