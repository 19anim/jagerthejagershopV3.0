import { Link } from "react-router-dom";
import Logo from "../../assets/logo.png";

const Footer = () => {
  return (
    <div className="pt-10">
      <div className="flex justify-center gap-3 md:gap-10 items-center pb-5">
        <Link to="/products">
          <div>Products</div>
        </Link>
        <Link
          to="https://www.tiktok.com/@odayiembanthuochoconhuou"
          target="_blank"
        >
          <div>Videos</div>
        </Link>
        <Link to="/">
          <img className="w-[60px] md:w-[80px]" src={Logo} alt="" />
        </Link>
        <Link to="tel:+84927183879">
          <div>Contact Us</div>
        </Link>
        <Link to="https://www.facebook.com/19.anim/" target="_blank">
          <div>About Us</div>
        </Link>
      </div>
      <div className="px-[10vw]">
        <hr></hr>
      </div>
      <div className="flex justify-center gap-10 items-center pt-5 text-2xl">
        <Link
          to="https://www.facebook.com/odayiembanthuochoconhuou"
          target="_blank"
        >
          <ion-icon name="logo-facebook"></ion-icon>
        </Link>
        <Link to="https://www.instagram.com/jagerthejager" target="_blank">
          <ion-icon name="logo-instagram"></ion-icon>
        </Link>
        <Link
          to="https://www.tiktok.com/@odayiembanthuochoconhuou"
          target="_blank"
        >
          <ion-icon name="logo-tiktok"></ion-icon>
        </Link>
        <Link to="tel:+84927183879">
          <ion-icon name="call-outline"></ion-icon>
        </Link>
      </div>
    </div>
  );
};

export default Footer;
