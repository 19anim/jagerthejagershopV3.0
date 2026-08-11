import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "../../context/user.context";
import { useLocale } from "../../context/locale.context";
import { apiUrl } from "../../utils/api.utils";
import FitButton from "../button/fitButton.component";

const GENERATE_LINK_CODE_API_URL = apiUrl("/api/telegram/generateLinkCode");

const LinkTelegram = () => {
  const { userInfor } = useContext(UserContext);
  const { t } = useLocale();
  const [code, setCode] = useState("");
  const [expiresInMinutes, setExpiresInMinutes] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerateCode = async () => {
    setErrorMessage("");
    setCopied(false);
    try {
      const result = await axios.post(GENERATE_LINK_CODE_API_URL, {}, { withCredentials: true });
      setCode(result.data.code);
      setExpiresInMinutes(result.data.expiresInMinutes);
    } catch (error) {
      setErrorMessage(error.response?.data?.errorMessage || t("orderFailed"));
    }
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
  };

  return (
    <div>
      <div className="mb-7 border-b border-white/10 pb-7">
        <p className="brand-kicker mb-2">JAGER THE JAGER · TELEGRAM</p>
        <h2 className="font-heading text-2xl font-extrabold uppercase text-cream">{t("linkTelegram")}</h2>
      </div>

      <div className="border border-white/10 bg-[#14231d] p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-mainOrange">
          {userInfor.telegramLinked ? t("telegramLinked") : t("telegramNotLinked")}
        </p>
      </div>

      {!userInfor.telegramLinked && (
        <div className="mt-5 flex flex-col gap-4">
          <FitButton type="button" onClick={handleGenerateCode}>
            {t("generateCode")}
          </FitButton>

          {code && (
            <div className="border border-white/10 bg-[#14231d] p-4">
              <p className="text-sm leading-6 text-cream/80">{t("telegramLinkInstructions")}</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="font-heading text-2xl font-extrabold tracking-widest text-cream">{code}</span>
                <button type="button" className="brand-button-outline" onClick={handleCopyCode}>
                  {copied ? t("codeCopied") : t("copyCode")}
                </button>
              </div>
              {expiresInMinutes != null && (
                <p className="mt-2 text-xs text-cream/60">
                  {t("telegramLinkCodeExpiry")} {expiresInMinutes} {t("minutes")}
                </p>
              )}
            </div>
          )}

          {errorMessage && <p className="text-sm text-red-300">{errorMessage}</p>}
        </div>
      )}
    </div>
  );
};

export default LinkTelegram;
