import { Link, Outlet } from "react-router-dom";
import Logo from "../../assets/logo.png";
import { useLocale } from "../../context/locale.context";

const AuthLayout = () => {
  const BACKGROUND_IMAGE = import.meta.env.VITE_AUTH_BACKGROUND_IMAGE;
  const hasCustomHeroImage = Boolean(BACKGROUND_IMAGE);
  const heroImage = BACKGROUND_IMAGE || Logo;
  const { localize, t } = useLocale();

  return (
    <section className="mx-auto grid min-h-[640px] max-w-6xl gap-0 px-4 py-10 md:px-8 lg:grid-cols-[46%_54%] lg:py-14">
      <div className="relative hidden overflow-hidden border border-warmGold/30 bg-[#102019] shadow-[0_28px_80px_rgba(0,0,0,0.38)] lg:block">
        <img
          className={
            hasCustomHeroImage
              ? "absolute inset-0 size-full object-cover object-[88%_center] opacity-85"
              : "absolute left-1/2 top-[38%] w-[150%] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-75"
          }
          src={heroImage}
          alt=""
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_28%,rgba(221,90,18,0.16),transparent_32%),linear-gradient(180deg,rgba(16,32,25,0.04),rgba(16,32,25,0.82))]" />
        <div className="absolute inset-x-8 top-8 h-px bg-warmGold/45" />
        <div className="absolute inset-y-8 left-8 w-px bg-warmGold/30" />
        <div className="absolute inset-y-8 right-8 w-px bg-warmGold/30" />
        <div className="absolute inset-x-0 bottom-0 p-8">
          <p className="brand-kicker mb-3">JAGER THE JAGER · EST. 2020</p>
          <h1 className="font-heading text-4xl font-extrabold uppercase leading-tight text-cream">{t("heroTitle")}</h1>
          <p className="mt-4 text-sm leading-6 text-cream/70">{t("responsible")}</p>
        </div>
      </div>
      <div className="brand-panel flex items-center justify-center p-6 md:p-10">
        <div className="flex w-full max-w-md flex-col items-center">
          <div className="relative mb-6 h-32 w-full overflow-hidden border border-warmGold/25 bg-[#102019] lg:hidden">
            <img
              className={
                hasCustomHeroImage
                  ? "absolute inset-0 size-full object-cover object-[88%_center] opacity-85"
                  : "absolute left-1/2 top-[38%] w-[150%] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-75"
              }
              src={heroImage}
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#102019]/75 to-transparent" />
          </div>
          <img className="mb-5 w-44" src={Logo} alt="JagerTheJager Shop" />
          <h2 className="text-center font-heading text-xl font-extrabold uppercase text-cream md:text-2xl">{t("welcome")}</h2>
          <p className="mt-2 text-center text-sm leading-6 text-cream/65">{t("welcomeBody")}</p>
          <Link className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-mainOrange transition hover:text-warmGold" to={localize("/")}>
            {t("backToShop")}
          </Link>
          <Outlet />
        </div>
      </div>
    </section>
  );
};

export default AuthLayout;
