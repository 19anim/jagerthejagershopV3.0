import { Fragment, useRef } from "react";
import "./bestSeller-Silder.style.css";

const BestSellerSlider = () => {
  const slide = useRef(null);
  const slideItems = useRef([]);
  const bestSellerItems = [
    {
      Name: "First Drink",
      Price: 400000,
      Image:
        "https://images.unsplash.com/photo-1609951651556-5334e2706168?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      Name: "Second Drink",
      Price: 100000,
      Image:
        "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      Name: "Third Drink",
      Price: 200000,
      Image:
        "https://plus.unsplash.com/premium_photo-1678051563662-60e365e8faa8?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      Name: "Fourth Drink",
      Price: 300000,
      Image:
        "https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      Name: "Fifth Drink",
      Price: 500000,
      Image:
        "https://images.unsplash.com/photo-1570598912132-0ba1dc952b7d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      Name: "Sixth Drink",
      Price: 600000,
      Image:
        "https://images.unsplash.com/photo-1587223962930-cb7f31384c19?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      Name: "Seventh Drink",
      Price: 700000,
      Image:
        "https://images.unsplash.com/photo-1550426735-c33c7ce414ff?q=80&w=1942&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];
  const prevActionButtonHandler = () => {
    slide.current.prepend(slideItems.current[slideItems.current.length - 1]);
    slideItems.current.unshift(slideItems.current.pop());
  };
  const nextActionButtonHandler = () => {
    slide.current.appendChild(slideItems.current[0]);
    slideItems.current.push(slideItems.current.shift());
  };
  return (
    <Fragment>
      <h3 className="text-[25px] font-bold">Best Seller</h3>
      <div className="bg-[#f5f5f5] h-[600px] relative">
        <div ref={slide} className="slide">
          {bestSellerItems.map((bestSellerItem, i) => {
            return (
              <div
                ref={(el) => (slideItems.current[i] = el)}
                key={bestSellerItem.Name}
                style={{ backgroundImage: `url(${bestSellerItem.Image})` }}
                className="slide-item w-[200px] h-[300px] absolute top-[50%] left- translate-y-[-50%] rounded-[20px] shadow-[0_30px_50px_#505050] bg-[50%_50%] bg-cover inline-block duration-500"
              >
                <div className="slide-item--content absolute top-[25%] left-[30px] md:top-[50%] md:left-[100px] text-left translate-y-[-50%] hidden">
                  <div className="content--name text-[30px] md:text-[40px]">
                    {bestSellerItem.Name}
                  </div>
                  <div className="content--price text-[15px] md:text-[20px] md:mt-[10px] md:mb-[20px] mt-[7.5px] mb-[15px]">
                    Chỉ với {bestSellerItem.Price} VNĐ
                  </div>
                  <button className="content--button px-[15px] py-[7.5px] md:px-[20px] md:py-[10px] border-none cursor-pointer bg-mainOrange text-black">
                    See more
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="animation-buttons absolute bottom-5 w-full text-center">
          <button
            onClick={prevActionButtonHandler}
            className="animation--prevButton w-10 h-10 rounded-[50%] bg-mainOrange mx-[5px] relative duration-500 hover:bg-[#e18300]"
          >
            <ion-icon
              name="chevron-back-outline"
              class="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
            ></ion-icon>
          </button>
          <button
            onClick={nextActionButtonHandler}
            className="animation--nextButton w-10 h-10 rounded-[50%] bg-mainOrange mx-[5px] relative duration-500 hover:bg-[#e18300]"
          >
            <ion-icon
              name="chevron-forward-outline"
              class="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
            ></ion-icon>
          </button>
        </div>
      </div>
    </Fragment>
  );
};

export default BestSellerSlider;
