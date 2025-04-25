import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { routers, appRouters } from "./router";
import { AuthProvider } from "./router/AuthContext";
import ProtectedRoute from "./router/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
    <Router>
    <ToastContainer position="top-right" autoClose={3000}
  style={{
    marginTop: "60px",    // push it lower from the top
    marginRight: "20px",  // push it left from the right edge
    zIndex: 9999,         // ensure it's above other elements
  }}
/>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            (() => {
              const loginRoute = routers.find((r) => r.path === "/");
              return loginRoute ? <loginRoute.component /> : null;
            })()
          }
        />
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {routers
            .filter((route) => route.path !== "/")
            .map((route, index) => {
              const Page = route.component;
              const Layout = route.layout || React.Fragment;
              return (
                <Route
                  key={index}
                  path={route.path}
                  element={
                    <Layout>
                      <Page />
                    </Layout>
                  }
                />
              );
            })}
          {appRouters.map((route, index) => {
            const Page = route.component;
            const Layout = route.layout || React.Fragment;
            return (
              <Route
                key={index}
                path={route.path}
                element={
                  <Layout>
                    <Page />
                  </Layout>
                }
              />
            );
          })}
        </Route>
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;