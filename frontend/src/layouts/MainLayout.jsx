import { NavLink, Outlet } from "react-router-dom";
import { UserButton, useUser } from "@clerk/react";

export default function MainLayout() {
  const { user } = useUser();

  return (
    <div className="flex h-screen bg-(--background)">
      {/* Sidebar */}
      <aside className="w-64 bg-(--surface) border-r border-(--border) p-4 flex flex-col">
        <div className="mb-4 flex justify-center items-center gap-3 px-2">
          <img src="/logo.png" alt="PC Cinco" className="w-35 object-contain" />
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <NavItem to="/" label="Dashboard" />
          <NavItem to="/clients" label="Clientes" />
          <NavItem to="/projects" label="Proyectos" />
          <NavItem to="/services" label="Servicios" />
          <NavItem to="/products" label="Productos" />
        </nav>

        {/* User section */}
        <div className="flex items-center gap-3 px-2 pt-4 border-t border-(--border)">
          <UserButton />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-(--text) truncate">
              {user?.fullName ?? user?.firstName ?? user?.username}
            </span>
            <span className="text-xs text-(--muted) truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Content */}
        <main className="flex-1 p-6 overflow-auto text-(--text)">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `
        px-3 py-2 rounded-lg text-sm font-medium
        ${
          isActive
            ? "bg-(--primary) text-white"
            : "text-(--muted) hover:bg-(--primary-hover) hover:text-(--text)"
        }
        `
      }
    >
      {label}
    </NavLink>
  );
}
