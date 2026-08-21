import Navigator from "../navigator/navigator.component";
import Footer from "../footer/footer.component";
import App from "../../App.jsx";
import { useShopMode, SHOP_MODE } from "../../hooks/useShopMode.hook";

// Mode-aware chrome: in 3D mode the shop fills the viewport with no navbar/footer;
// in classic mode the usual navbar + footer wrap the routed content.
const AppShell = () => {
  const { mode } = useShopMode();

  if (mode === SHOP_MODE.THREE_D) {
    return (
      <main className="h-screen w-screen overflow-hidden">
        <App />
      </main>
    );
  }

  return (
    <>
      <Navigator />
      <main className="min-h-[60vh]">
        <App />
      </main>
      <Footer />
    </>
  );
};

export default AppShell;
