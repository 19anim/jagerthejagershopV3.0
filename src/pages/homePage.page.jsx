import BestSellerSlider from "../components/bestSeller-Slider/bestSeller-Slider.component";
const HomePage = () => {
  return (
    <div>
      <div className="flex flex-col items-center pb-5 md:pb-[80px]">
        <h1 className="text-[25px] md:text-[80px] font-bold">
          JAGERTHEJAGER <span className="text-mainOrange">SHOP</span>.
        </h1>
        <h5 className="text-[15px] md:text-[22px]">Ở đây iem bán thuốc ho con hươu</h5>
      </div>
      <div>
        <BestSellerSlider />
      </div>
    </div>
  );
};

export default HomePage;
