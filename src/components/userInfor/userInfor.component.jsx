import { UserContext } from "../../context/user.context";
import { useContext } from "react";
import { Link } from "react-router-dom";
import Avatar from "../../assets/avatar.png";
import { useLocale } from "../../context/locale.context";

const UserInfor = () => {
  const { userInfor } = useContext(UserContext);
  const { localize, t } = useLocale();
  const showValue = (value) => value || t("notFilled");
  const address = [userInfor.address, userInfor.ward, userInfor.district, userInfor.city].filter(Boolean).join(", ");

  return (
    <div>
      <div className="mb-7 flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-center">
        <img src={Avatar} className="size-24 rounded-full border border-warmGold/35 object-cover" alt="" />
        <div>
          <p className="brand-kicker mb-2">JAGER THE JAGER · MEMBER</p>
          <h2 className="font-heading text-2xl font-extrabold uppercase text-cream">{userInfor.userName}</h2>
          <p className="mt-2 text-sm text-cream/60">{userInfor.email}</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Info label={t("fullName")} value={showValue(userInfor.userName)} />
        <Info label={t("phoneNumber")} value={showValue(userInfor.phoneNumber)} />
        <Info label="Email" value={showValue(userInfor.email)} />
        <Info label={t("recipientName")} value={showValue(userInfor.receipentName)} />
        <div className="md:col-span-2"><Info label={t("address")} value={showValue(address)} /></div>
      </div>
      <Link className="brand-button mt-7" to={localize("/user/updateInformation")}>{t("updateInformation")}</Link>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="border border-white/10 bg-[#14231d] p-4">
    <p className="text-xs font-bold uppercase tracking-widest text-mainOrange">{label}</p>
    <p className="mt-2 text-sm leading-6 text-cream/80">{value}</p>
  </div>
);

export default UserInfor;
