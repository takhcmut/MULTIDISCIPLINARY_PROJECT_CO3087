import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../router/AuthContext";
import "./Login.scss";

import houseImage from "../../assets/login_house.png";
import windTurbine from "../../assets/wind_power.png";
import leaves from "../../assets/leaves.png";

const API_BASE_URL = "http://localhost:8080";

const Login = () => {
  const navigate = useNavigate();
  const { setToken } = useContext(AuthContext);
  const [isRegister, setIsRegister] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [field, setField] = useState({
    username: "",
    passwd: "",
  });

  const setFieldValue = ({ target: { name, value } }) => {
    setField((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const endpoint = `${API_BASE_URL}/auth/login`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: field.username,
          password: field.passwd,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      const { token, role } = data;
      localStorage.setItem("token", token);
      localStorage.setItem("isAuth", "yes");
      localStorage.setItem("role", role);
      localStorage.setItem("username", field.username);
      setToken(token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error.message);
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginPage">
      <img src={windTurbine} alt="Wind Turbine" className="bgWindTurbine" />
      <img src={houseImage} alt="House" className="bgHouse" />
      <img src={leaves} alt="Leaves" className="bgLeaves" />

      {loading && (
        <div className="loadingOverlay">
          <div className="spinner"></div>
          <p>Logging in...</p>
        </div>
      )}

      <div className="formCard">
        <h1>{isRegister ? "Welcome, User!" : "Hello, User!"}</h1>
        <div className="tabs">
          <span
            className={!isRegister ? "activeTab" : "inactiveTab"}
            onClick={() => {
              setIsRegister(false);
              setErr("");
            }}
          >
            Login
          </span>
          <span
            className={isRegister ? "activeTab" : "inactiveTab"}
            onClick={() => {
              setIsRegister(true);
              setErr("");
            }}
          >
            SignUp
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="inputGroup">
            <input
              type="text"
              name="username"
              value={field.username}
              onChange={setFieldValue}
              placeholder="Enter your username"
              required
            />
            <div className="passwordFieldContainer">
              <input
                type="password"
                name="passwd"
                value={field.passwd}
                onChange={setFieldValue}
                placeholder="Enter Password"
                required
              />
              <svg
                className="passwordIcon"
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M20.53 4.53a.75.75 0 0 0-1.06-1.06l-16 16a.75.75 0 1 0 1.06 1.06l3.035-3.035C8.883 18.103 10.392 18.5 12 18.5c2.618 0 4.972-1.051 6.668-2.353c.85-.652 1.547-1.376 2.035-2.08c.48-.692.797-1.418.797-2.067s-.317-1.375-.797-2.066c-.488-.705-1.185-1.429-2.035-2.08q-.406-.313-.86-.601zm-5.4 5.402l-1.1 1.098a2.25 2.25 0 0 1-3 3l-1.1 1.1a3.75 3.75 0 0 0 5.197-5.197"
                  clipRule="evenodd"
                ></path>
                <path
                  fill="currentColor"
                  d="M12.67 8.31a.26.26 0 0 0 .23-.07l1.95-1.95a.243.243 0 0 0-.104-.407A10.2 10.2 0 0 0 12 5.5c-2.618 0-4.972 1.051-6.668 2.353c-.85.652-1.547 1.376-2.036 2.08c-.48.692-.796 1.418-.796 2.067s.317 1.375.796 2.066a9.3 9.3 0 0 0 1.672 1.79a.246.246 0 0 0 .332-.017l2.94-2.94a.26.26 0 0 0 .07-.23q-.06-.325-.06-.669a3.75 3.75 0 0 1 4.42-3.69"
                ></path>
              </svg>
            </div>
          </div>

          <small className="errorMsg">{err}</small>
          <button type="submit">{isRegister ? "Register" : "Login"}</button>
        </form>

        <p className="orText">Or</p>
        <div className="socialIcons">
          <img
            src="https://img.icons8.com/color/48/google-logo.png"
            alt="Google Login"
          />
          <img
            src="https://img.icons8.com/color/48/facebook-new.png"
            alt="Facebook Login"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
