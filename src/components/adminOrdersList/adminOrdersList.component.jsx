import axios from "axios";
import { apiUrl } from "../../utils/api.utils";
import { useEffect, useMemo, useState } from "react";
import OrderItem from "../orderHistory/orderItem.component";
import { useLocale } from "../../context/locale.context";
import AdminOrderStatus from "../admin-order-status/admin-order-status.component";

const PAGE_SIZE = 5;

const AdminOrdersList = () => {
  const GETALLORDERS_API_URL = apiUrl("/api/orders/getAllOrders");
  const [orderItems, setOrderItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useLocale();

  useEffect(() => {
    const getOrders = async () => {
      const result = await axios.post(GETALLORDERS_API_URL, {}, { withCredentials: true });
      if (result.status === 200) setOrderItems(result.data);
    };
    getOrders();
  }, []);

  const statusOptions = useMemo(
    () => Array.from(new Set(orderItems.map((order) => order.status?.[0]?.statusName).filter(Boolean))),
    [orderItems]
  );

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return orderItems.filter((order) => {
      const statusName = order.status?.[0]?.statusName || "";
      const matchesStatus = statusFilter === "ALL" || statusName === statusFilter;
      const searchableText = [order.userName, order.receipentName, order.phoneNumber, order.address, order._id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!normalizedSearch || searchableText.includes(normalizedSearch));
    });
  }, [orderItems, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const visibleOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const updateFilters = (setter) => (event) => {
    setter(event.target.value);
    setCurrentPage(1);
  };

  const updateOrderInList = (updatedOrder) => {
    setOrderItems((currentOrders) =>
      currentOrders.map((order) => order._id === updatedOrder._id ? { ...order, ...updatedOrder } : order)
    );
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
      <div className="brand-panel p-5 md:p-8">
        <p className="brand-kicker mb-2">{t("adminOrdersEyebrow")}</p>
        <h1 className="font-heading text-3xl font-extrabold uppercase text-cream">{t("orderList")}</h1>
        <div className="mt-6 grid gap-3 md:grid-cols-[1fr_220px]">
          <input
            className="border border-white/15 bg-[#14231d] px-4 py-3 text-sm text-cream outline-none focus:border-mainOrange"
            onChange={updateFilters(setSearchTerm)}
            placeholder={t("searchOrders")}
            type="search"
            value={searchTerm}
          />
          <select
            className="border border-white/15 bg-[#14231d] px-4 py-3 text-sm text-cream outline-none focus:border-mainOrange"
            onChange={updateFilters(setStatusFilter)}
            value={statusFilter}
          >
            <option value="ALL">{t("allStatuses")}</option>
            {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
        <p className="mt-4 text-xs uppercase tracking-widest text-cream/50">{t("orderResults")}: {filteredOrders.length}</p>
        <div className="mt-5 flex flex-col gap-5">
          {visibleOrders.length === 0
            ? <p className="border border-white/10 bg-[#14231d] p-5 text-cream/70">{t("emptyFilteredOrders")}</p>
            : visibleOrders.map((orderItem, index) => (
              <OrderItem
                action={<AdminOrderStatus order={orderItem} onStatusUpdated={updateOrderInList} />}
                detailPath={`/admin/orders/${orderItem._id}`}
                key={orderItem._id}
                orderItem={orderItem}
                orderIndex={(currentPage - 1) * PAGE_SIZE + index + 1}
              />
            ))}
        </div>
        {totalPages > 1 && (
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
            <button className="brand-button-outline min-h-0 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>{t("previousPage")}</button>
            <p className="text-sm text-cream/65">{t("page")} {currentPage} / {totalPages}</p>
            <button className="brand-button-outline min-h-0 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)}>{t("nextPage")}</button>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminOrdersList;
