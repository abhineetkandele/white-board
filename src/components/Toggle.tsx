import { useContext } from "react";
import { InitialStateType, PropsType, StateType } from "../types/types";
import { AppContext } from "../context";

const Toggle = ({ id }: PropsType) => {
  const { setState, ...state }: InitialStateType = useContext(AppContext);

  const value = state[id as keyof StateType];

  return (
    <div className="toggle">
      <input
        type="checkbox"
        id={id}
        checked={!!value}
        onChange={() => setState!(id, !value)}
      />
      <label htmlFor={id}></label>
    </div>
  );
};

export default Toggle;
