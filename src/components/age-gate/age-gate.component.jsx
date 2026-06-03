import { useState } from "react";
import Logo from "../../assets/logo.png";
import { useLocale } from "../../context/locale.context";

const AgeGate = () => {
  const [isConfirmed, setIsConfirmed] = useState(
    () => localStorage.getItem("age_confirmed") === "true"
  );
  const { t } = useLocale();

  if (isConfirmed) return null;

  const confirmAge = () => {
    localStorage.setItem("age_confirmed", "true");
    setIsConfirmed(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#101a15]/95 p-5">
      <div className="max-w-lg border border-warmGold/50 bg-cream p-7 text-center text-ink shadow-2xl md:p-10">
        <img src={Logo} alt="JagerTheJager Shop" className="mx-auto mb-5 w-44" />
        <p className="brand-kicker mb-3">{t("heroEyebrow")}</p>
        <h2 className="font-heading text-3xl font-bold uppercase">{t("ageTitle")}</h2>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-ink/70">{t("ageBody")}</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button className="brand-button" onClick={confirmAge}>{t("enter")}</button>
          <a className="brand-button-outline" href="https://www.google.com">{t("leave")}</a>
        </div>
      </div>
    </div>
  );
};

export default AgeGate;
