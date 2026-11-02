import { createContext, useContext } from "react";
import { QUALITY } from "./quality";

export const QualityContext = createContext(QUALITY.high);
export const useQuality = () => useContext(QualityContext);
