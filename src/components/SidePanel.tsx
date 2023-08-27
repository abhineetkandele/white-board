import { sidePanelConfig } from "../Config/SidePanel";
import Range from "./Range";
import Selector from "./Selector";
import Toggle from "./Toggle";
import { ConfigRootType, ConfigType, SectionType } from "../types/types";

const sectionTypes: {
  selector: SectionType;
  toggle: SectionType;
  range: SectionType;
} = {
  selector: Selector,
  toggle: Toggle,
  range: Range,
};

const SidePanel = () => {
  return (
    <div className="panel-container side">
      {sidePanelConfig.map(
        ({
          id,
          label,
          type,
          config,
          min,
          max,
        }: {
          id: string;
          label: string;
          type: string;
          config?: ConfigType[];
          min?: number | undefined;
          max?: number | undefined;
        }) => {
          const Section = sectionTypes[type as ConfigRootType];

          return (
            <div className="section" key={id}>
              <label>{label}</label>

              <Section config={config} id={id} min={min} max={max} />
            </div>
          );
        }
      )}
    </div>
  );
};

export default SidePanel;
