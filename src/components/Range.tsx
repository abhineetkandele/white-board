import { useContext } from "react";
import { InitialStateType, PropsType, StateType } from "../types/types";
import { AppContext } from "../context";

const Range = ({ id, min, max }: PropsType) => {
  const { setState, ...state }: InitialStateType = useContext(AppContext);

  const value = state[id as keyof StateType];

  return (
    <div className="range">
      <input
        type="range"
        max={max}
        min={min}
        id={id}
        onChange={(e) => setState!(id, e.target.value)}
        value={value as string}
      />
    </div>
  );
};

export default Range;
