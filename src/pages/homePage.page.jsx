import BestSellerSlider from "../components/bestSeller-Slider/bestSeller-Slider.component";
import ShopModeSelector from "../components/shop-mode-selector/shop-mode-selector.component";

const HomePage = () => {
  return (
    <>
      <ShopModeSelector />
      <section className="mx-auto flex min-h-[360px] max-w-[1440px] flex-col items-center justify-center px-5 py-16 text-center text-cream md:min-h-[460px] md:py-24">
        <h1 className="text-[34px] font-extrabold leading-tight tracking-tight md:text-[80px]">
          JAGERTHEJAGER <span className="text-mainOrange">SHOP</span>.
        </h1>
        <p className="mt-3 text-[16px] font-medium text-cream/85 md:text-[22px]">
          Ở đây iem bán thuốc ho con hươu
        </p>
      </section>
      <BestSellerSlider />
    </>
  );
};

export default HomePage;
