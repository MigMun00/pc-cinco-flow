import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RedirectToSignIn, useUser } from "@clerk/react";

import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard";
import Clients from "../pages/Clients";
import Products from "../pages/Products";
import Projects from "../pages/Projects";
import ProjectDetail from "../pages/ProjectDetail";
import Services from "../pages/Services";

function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <RedirectToSignIn />;

  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/sign-in/*" element={<RedirectToSignIn />} />
        <Route path="/login" element={<RedirectToSignIn />} />

        {/* Protected with layout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/products" element={<Products />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
