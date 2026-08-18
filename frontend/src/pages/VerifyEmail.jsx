import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const verify = async () => {
      try {
        const { data } = await api.get(`/auth/verify-email/${token}`);
        setStatus(data.message);
      } catch (err) {
        setStatus(err.response?.data?.message || "Verification failed");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md card p-6 sm:p-8 text-center">
        <h1 className="text-lg sm:text-xl font-semibold mb-3">Email Verification</h1>
        <p className="text-sm text-gray-600">{status}</p>
      </div>
    </div>
  );
};

export default VerifyEmail;
