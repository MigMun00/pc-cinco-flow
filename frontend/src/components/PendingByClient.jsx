import { Link } from "react-router-dom";
import { money } from "../services/api";

function PendingList({ title, items, to }) {
  return (
    <div className="rounded-lg border border-(--border) bg-slate-800/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-(--muted)">
          {title}
        </p>
        <span className="text-xs text-(--muted)">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-(--muted)">Sin pendientes.</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between text-sm"
            >
              <span className="truncate pr-3 text-(--text)">{item.name}</span>
              <span className="font-medium text-(--warning)">
                {money.format(item.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link
        to={to}
        className="mt-3 inline-flex text-xs font-medium text-(--primary-hover) hover:underline"
      >
        Gestionar {title.toLowerCase()}
      </Link>
    </div>
  );
}

export default function PendingByClient({ clients }) {
  return (
    <section className="rounded-2xl border border-(--border) bg-(--surface) p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-(--text)">
          Pendientes por Cliente
        </h2>
      </div>

      {clients.length === 0 ? (
        <p className="text-sm text-(--muted)">No hay facturas pendientes.</p>
      ) : (
        <div className="space-y-4">
          {clients.map((client) => (
            <article
              key={client.id}
              className="rounded-xl border border-(--border) p-4"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-(--text)">
                  {client.name}
                </h3>
                <p className="text-sm font-semibold text-(--warning)">
                  Pendiente: {money.format(client.totalPending)}
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <PendingList
                  title="Proyectos"
                  items={client.pendingProjects}
                  to="/projects"
                />
                <PendingList
                  title="Servicios"
                  items={client.pendingServices}
                  to="/services"
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
