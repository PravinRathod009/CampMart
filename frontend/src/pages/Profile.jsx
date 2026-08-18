import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import SellerVerification from "../components/SellerVerification";

const Profile = () => {
  const { user, refreshMe } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    college: user?.college || "",
    stream: user?.stream || "",
    branch: user?.branch || "",
    academicYear: user?.academicYear || "",
  });
  const [picture, setPicture] = useState(null);
  const [preview, setPreview] = useState(user?.profilePicture || "");
  const [saving, setSaving] = useState(false);

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    setPicture(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (picture) fd.append("profilePicture", picture);

      await api.put("/users/me", fd, { headers: { "Content-Type": "multipart/form-data" } });
      await refreshMe();
      showToast("Profile updated successfully", "success");
    } catch (err) {
      // global error toast handles failure
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <div className="card p-5 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-6">Edit Profile</h1>

        <form onSubmit={submit} className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border">
              {preview ? (
                <img src={preview} alt="Profile preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <label htmlFor="profile-picture" className="text-sm font-medium text-gray-700 block mb-1">Profile Picture</label>
              <input
                id="profile-picture"
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
                className="text-xs sm:text-sm w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary-light file:text-primary-dark file:font-medium hover:file:bg-primary/20"
              />
            </div>
          </div>

          <div>
            <label htmlFor="profile-name" className="text-sm font-medium text-gray-700">Name</label>
            <input id="profile-name" className="input-field mt-1.5" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label htmlFor="profile-phone" className="text-sm font-medium text-gray-700">Phone</label>
            <input id="profile-phone" type="tel" className="input-field mt-1.5" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Your contact number" />
          </div>
          <div>
            <label htmlFor="profile-college" className="text-sm font-medium text-gray-700">College</label>
            <input id="profile-college" className="input-field mt-1.5" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="profile-stream" className="text-sm font-medium text-gray-700">Stream</label>
              <input id="profile-stream" className="input-field mt-1.5" value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value })} />
            </div>
            <div>
              <label htmlFor="profile-branch" className="text-sm font-medium text-gray-700">Branch</label>
              <input id="profile-branch" className="input-field mt-1.5" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} />
            </div>
          </div>
          <div>
            <label htmlFor="profile-year" className="text-sm font-medium text-gray-700">Academic Year</label>
            <input id="profile-year" className="input-field mt-1.5" value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} />
          </div>

          <button disabled={saving} className="btn-primary w-full py-2.5">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      <SellerVerification />
    </div>
  );
};

export default Profile;
