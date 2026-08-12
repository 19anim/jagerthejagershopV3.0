import { useContext } from "react";
import { Link, Outlet } from "react-router-dom";
import { useLocale } from "../../context/locale.context";
import { UserContext } from "../../context/user.context";

const AccountLayout = () => {
  const { localize, t } = useLocale();
  const { isAdmin } = useContext(UserContext);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
      <div className="mb-6">
        <p className="brand-kicker mb-2">JAGER THE JAGER · ACCOUNT</p>
        <h1 className="font-heading text-3xl font-extrabold uppercase text-cream md:text-5xl">{t("account")}</h1>
      </div>
      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <aside className="brand-panel flex flex-col gap-2 p-4">
          <Link className="account-nav-link" to={localize("/user/userInformation")}>{t("accountOverview")}</Link>
          {!isAdmin && (
            <Link className="account-nav-link" to={localize("/user/orders")}>{t("orders")}</Link>
          )}
          {isAdmin && (
            <Link className="account-nav-link" to={localize("/user/linkTelegram")}>{t("linkTelegram")}</Link>
          )}
        </aside>
        <div className="brand-panel p-5 md:p-8">
          <Outlet />
        </div>
      </div>
    </section>
  );
};

export default AccountLayout;
