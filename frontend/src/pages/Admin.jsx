import { useEffect, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const tabs = ["Overview", "Users", "Listings", "ID Verification", "Reports"];

const Admin = () => {
  const { showToast } = useToast();
  const [tab, setTab] = useState("Overview");
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [reports, setReports] = useState([]);
  const [idVerifications, setIdVerifications] = useState([]);
  const [zoomImage, setZoomImage] = useState(null);

  const loadOverview = async () => setAnalytics((await api.get("/admin/analytics")).data);
  const loadUsers = async () => setUsers((await api.get("/admin/users")).data);
  const loadProducts = async () => setProducts((await api.get("/admin/products")).data);
  const loadReports = async () => setReports((await api.get("/admin/reports")).data);
  const loadIdVerifications = async () =>
    setIdVerifications((await api.get("/admin/id-verifications", { params: { status: "Pending" } })).data);

  useEffect(() => {
    if (tab === "Overview") loadOverview();
    if (tab === "Users") loadUsers();
    if (tab === "Listings") loadProducts();
    if (tab === "ID Verification") loadIdVerifications();
    if (tab === "Reports") loadReports();
  }, [tab]);

  const toggleBan = async (id) => { await api.put(`/admin/users/${id}/ban`); loadUsers(); };
  const setApproval = async (id, approvalStatus) => { await api.put(`/admin/products/${id}/approval`, { approvalStatus }); loadProducts(); };
  const removeProduct = async (id) => { if (confirm("Remove this listing?")) { await api.delete(`/admin/products/${id}`); loadProducts(); } };
  const updateReport = async (id, status) => { await api.put(`/admin/reports/${id}`, { status }); loadReports(); };

  const approveId = async (id) => {
    await api.put(`/admin/id-verifications/${id}`, { decision: "Approved" });
    showToast("Seller approved ✅", "success");
    loadIdVerifications();
  };

  const rejectId = async (id) => {
    const reason = prompt("Reason for rejection (shown to the seller):", "ID photo unclear, please resubmit");
    if (reason === null) return;
    await api.put(`/admin/id-verifications/${id}`, { decision: "Rejected", rejectionReason: reason });
    showToast("Seller ID rejected", "info");
    loadIdVerifications();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded font-medium ${tab === t ? "bg-primary text-white" : "bg-white border"}`}
          >
            {t}
            {t === "ID Verification" && idVerifications.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {idVerifications.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "Overview" && analytics && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {Object.entries(analytics).map(([key, value]) => (
            <div key={key} className="bg-white rounded-lg shadow p-4 text-center">
              <p className="text-2xl font-bold text-primary">{value}</p>
              <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "Users" && (
        <div className="bg-white rounded-lg shadow divide-y">
          {users.map((u) => (
            <div key={u._id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">
                  {u.name} <span className="text-xs text-gray-400">({u.role})</span>
                  {u.isVerifiedSeller && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">✅ Verified Seller</span>}
                </p>
                <p className="text-sm text-gray-500">{u.email}</p>
              </div>
              <button
                onClick={() => toggleBan(u._id)}
                className={`text-sm px-3 py-1 rounded ${u.isBanned ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
              >
                {u.isBanned ? "Unban" : "Ban"}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "Listings" && (
        <div className="bg-white rounded-lg shadow divide-y">
          {products.map((p) => (
            <div key={p._id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{p.title}</p>
                <p className="text-sm text-gray-500">₹{p.price} · {p.seller?.name} · {p.approvalStatus}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setApproval(p._id, "Approved")} className="text-sm bg-green-500 text-white px-3 py-1 rounded">Approve</button>
                <button onClick={() => setApproval(p._id, "Rejected")} className="text-sm bg-yellow-500 text-white px-3 py-1 rounded">Reject</button>
                <button onClick={() => removeProduct(p._id)} className="text-sm bg-red-500 text-white px-3 py-1 rounded">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "ID Verification" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Review submitted ID cards to confirm sellers are real people before they can list products.
          </p>
          {idVerifications.length === 0 ? (
            <p className="text-gray-500 bg-white rounded-lg shadow p-6 text-center">No pending ID verifications 🎉</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {idVerifications.map((u) => (
                <div key={u._id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                      <p className="text-xs text-gray-400">{u.college}</p>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Pending</span>
                  </div>

                  {u.idCardImage && (
                    <img
                      src={u.idCardImage}
                      alt="ID card"
                      onClick={() => setZoomImage(u.idCardImage)}
                      className="w-full h-40 object-cover rounded border cursor-zoom-in mb-3"
                    />
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => approveId(u._id)} className="flex-1 bg-green-500 text-white text-sm py-1.5 rounded font-semibold">
                      ✅ Approve
                    </button>
                    <button onClick={() => rejectId(u._id)} className="flex-1 bg-red-500 text-white text-sm py-1.5 rounded font-semibold">
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {zoomImage && (
            <div
              onClick={() => setZoomImage(null)}
              className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-6 cursor-zoom-out"
            >
              <img src={zoomImage} alt="ID card zoomed" className="max-h-[85vh] max-w-full rounded shadow-lg" />
            </div>
          )}
        </div>
      )}

      {tab === "Reports" && (
        <div className="bg-white rounded-lg shadow divide-y">
          {reports.map((r) => (
            <div key={r._id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{r.reason}</p>
                <p className="text-sm text-gray-500">
                  By {r.reporter?.name} {r.product ? `· Listing: ${r.product.title}` : ""} · {r.status}
                </p>
              </div>
              <select
                value={r.status}
                onChange={(e) => updateReport(r._id, e.target.value)}
                className="border rounded p-1 text-sm"
              >
                <option value="Open">Open</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Dismissed">Dismissed</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Admin;
