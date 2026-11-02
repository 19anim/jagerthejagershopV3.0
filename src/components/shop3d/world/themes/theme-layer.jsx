import Tet from "./tet";
import Christmas from "./christmas";
import MidAutumn from "./midautumn";
import Halloween from "./halloween";

const LAYERS = { tet: Tet, christmas: Christmas, midautumn: MidAutumn, halloween: Halloween };

// Mounts the decor for the active seasonal theme, or nothing.
const ThemeLayer = ({ theme }) => {
  const Layer = LAYERS[theme];
  return Layer ? <Layer /> : null;
};

export default ThemeLayer;
