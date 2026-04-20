import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { UserButton, useUser } from "@clerk/react";

export default function MainLayout() {
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    function handleEscape(event) {
      if (event.key === "Escape") setIsMenuOpen(false);
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="min-h-screen bg-(--background) text-(--text)">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-(--border) bg-(--surface) p-4 md:flex md:flex-col">
          <SidebarContent user={user} onNavigate={closeMenu} />
        </aside>

        {isMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={closeMenu}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-(--border) bg-(--surface) p-4 shadow-2xl transition-transform duration-200 md:hidden ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent user={user} onNavigate={closeMenu} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-(--border) bg-(--background)/95 px-4 py-3 backdrop-blur md:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-(--border) bg-(--surface) text-(--text)"
              aria-label="Abrir navegación"
            >
              <span className="text-lg">☰</span>
            </button>

            <img
              src="/logo.png"
              alt="PC Cinco"
              className="w-auto max-h-10 object-contain"
            />

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-(--border) bg-(--surface)">
              <UserButton />
            </div>
          </header>

          <main className="flex-1 overflow-auto px-4 py-4 sm:px-6 sm:py-6">
            <div className="mx-auto flex w-full flex-col gap-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({ user, onNavigate }) {
  return (
    <>
      <div className="mb-6 flex items-center justify-center px-2">
        <img
          src="/logo.png"
          alt="PC Cinco"
          className="w-auto max-h-20 object-contain"
        />
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        <NavItem to="/" label="Dashboard" onClick={onNavigate} />
        <NavItem to="/clients" label="Clientes" onClick={onNavigate} />
        <NavItem to="/projects" label="Proyectos" onClick={onNavigate} />
        <NavItem to="/services" label="Servicios" onClick={onNavigate} />
        <NavItem to="/products" label="Productos" onClick={onNavigate} />
      </nav>

      <div className="mt-6 flex items-center gap-3 border-t border-(--border) px-2 pt-4">
        <UserButton />
        <div className="min-w-0 flex flex-col">
          <span className="truncate text-sm font-medium text-(--text)">
            {user?.fullName ?? user?.firstName ?? user?.username}
          </span>
          <span className="truncate text-xs text-(--muted)">
            {user?.primaryEmailAddress?.emailAddress}
          </span>
        </div>
      </div>
    </>
  );
}

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
          isActive
            ? "bg-(--primary) text-white"
            : "text-(--muted) hover:bg-(--primary-hover) hover:text-(--text)"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
