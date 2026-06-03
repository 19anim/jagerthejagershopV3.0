import "./loading-spinner.styles.css";
import { useLocale } from "../../context/locale.context";

const LoadingSpinner = () => {
  const { t } = useLocale();
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="loading-spinner" aria-hidden="true" />
      <div className=" inline-block">
        <p className="loading-spinner--text">{t("loading")}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
