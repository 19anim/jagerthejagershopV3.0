import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/homePage.page";
import Navigator from "./components/navigator/navigator.component";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigator />}>
        <Route index element={<HomePage />} />
      </Route>
    </Routes>
  );
};

export default App;
