import React, { useContext, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../router/AuthContext";

const ProtectedRoute = () => {
  const { token } = useContext(AuthContext);
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    if (!token && !notified) {
      toast.info("Your session has expired, please log in again.");
      setNotified(true);
    }
  }, [token, notified]);

  return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;

