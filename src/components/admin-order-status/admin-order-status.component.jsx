import { useState } from "react";
import axios from "axios";
import { apiUrl } from "../../utils/api.utils";
import { useLocale } from "../../context/locale.context";

export const ORDER_STATUSES = ["CREATED", "CONFIRMED", "SHIPPING", "COMPLETED"];

const AdminOrderStatus = ({ order, onStatusUpdated }) => {
  const [statusName, setStatusName] = useState(order.status?.[0]?.statusName || ORDER_STATUSES[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { t } = useLocale();

  const saveStatus = async () => {
    setIsSaving(true);
    setErrorMessage("");
    try {
      const response = await axios.put(
        apiUrl(`/api/orders/${order._id}/status`),
        { statusName },
        { withCredentials: true }
      );
      onStatusUpdated?.(response.data);
    } catch (error) {
      setErrorMessage(error.response?.data?.errorMessage || t("orderStatusUpdateFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className="border border-white/15 bg-[#14231d] px-3 py-2 text-xs font-bold uppercase tracking-wider text-cream"
        onChange={(event) => setStatusName(event.target.value)}
        value={statusName}
      >
        {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
      </select>
      <button className="brand-button min-h-0 px-3 py-2 text-[11px]" disabled={isSaving} onClick={saveStatus}>
        {isSaving ? t("saving") : t("updateStatus")}
      </button>
      {errorMessage && <p className="basis-full text-xs text-red-300">{errorMessage}</p>}
    </div>
  );
};

export default AdminOrderStatus;
