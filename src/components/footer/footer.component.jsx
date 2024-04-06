import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="pt-10">
      <div className="flex justify-center gap-3 md:gap-10 items-center pb-5">
        <div>Products</div>
        <div>Videos</div>
        <img className="w-[60px] md:w-[80px]" src="../src/assets/logo.png" alt="" />
        <div>Contact Us</div>
        <div>About Us</div>
      </div>
      <div className="px-[10vw]">
        <hr></hr>
      </div>
      <div className="flex justify-center gap-10 items-center pt-5 text-2xl">
        <Link>
          <ion-icon name="logo-facebook"></ion-icon>
        </Link>
        <Link>
          <ion-icon name="logo-instagram"></ion-icon>
        </Link>
        <Link>
          <ion-icon name="logo-tiktok"></ion-icon>
        </Link>
        <Link>
          <ion-icon name="call-outline"></ion-icon>
        </Link>
      </div>
    </div>
  );
};

export default Footer;
