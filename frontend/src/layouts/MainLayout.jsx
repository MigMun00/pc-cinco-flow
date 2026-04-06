import { NavLink, Outlet } from "react-router-dom";
import { UserButton } from "@clerk/react";

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-(--background)">
      {/* Sidebar */}
      <aside className="w-64 bg-(--surface) border-r border-(--border) p-4">
        <div className="mb-4 flex justify-center items-center gap-3 px-2">
          <img src="/logo.png" alt="PC Cinco" className="w-35 object-contain" />
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem to="/" label="Dashboard" />
          <NavItem to="/clients" label="Clients" />
          <NavItem to="/projects" label="Projects" />
          <NavItem to="/services" label="Services" />
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-14 bg-(--surface) border-b border-(--border) flex items-center justify-end px-4">
          <UserButton />
        </header>

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
