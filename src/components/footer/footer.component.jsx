import { Link } from "react-router-dom";
import Logo from "../../assets/logo.png";
import { useLocale } from "../../context/locale.context";

const Footer = () => {
  const { localize, t } = useLocale();
  return (
    <footer className="mt-16 bg-mainGreen text-cream">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div><img className="mb-4 w-44" src={Logo} alt="JagerTheJager Shop" /><p className="max-w-md text-sm leading-6 text-cream/70">{t("responsible")}</p></div>
        <div><p className="brand-kicker mb-4">{t("products")}</p><Link className="text-sm text-cream/80 hover:text-mainOrange" to={localize("/products")}>{t("shopNow")}</Link></div>
        <div>
          <p className="brand-kicker mb-4">{t("follow")}</p>
          <div className="flex gap-4 text-2xl">
            <a href="https://www.facebook.com/odayiembanthuochoconhuou" target="_blank" rel="noreferrer"><ion-icon name="logo-facebook"></ion-icon></a>
            <a href="https://www.instagram.com/jagerthejager" target="_blank" rel="noreferrer"><ion-icon name="logo-instagram"></ion-icon></a>
            <a href="https://www.tiktok.com/@odayiembanthuochoconhuou" target="_blank" rel="noreferrer"><ion-icon name="logo-tiktok"></ion-icon></a>
            <a href="tel:+84927183879"><ion-icon name="call-outline"></ion-icon></a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-4 text-center text-[11px] uppercase tracking-[0.16em] text-cream/55">JagerTheJager Shop · {t("responsible")}</div>
    </footer>
  );
};

export default Footer;
