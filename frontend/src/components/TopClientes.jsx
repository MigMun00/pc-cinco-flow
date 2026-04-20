import { money } from "../services/api";

function ClientBar({ client }) {
  const total = client.totalPotential || 1;
  const invoicedPct = (client.totalInvoiced / total) * 100;
  const pendingPct = (client.totalPending / total) * 100;

  return (
    <div className="rounded-xl border border-(--border) p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-(--text)">{client.name}</p>
      </div>

      <div className="flex h-2 overflow-hidden rounded-full bg-slate-700/60">
        {invoicedPct > 0 && (
          <div
            className="h-full bg-(--success)"
            style={{ width: `${invoicedPct}%` }}
          />
        )}
        {pendingPct > 0 && (
          <div
            className="h-full bg-(--danger)"
            style={{ width: `${pendingPct}%` }}
          />
        )}
      </div>

      <div className="mt-2 flex flex-col gap-1 text-xs sm:flex-row sm:justify-between">
        <span className="text-(--success)">
          Facturado: {money.format(client.totalInvoiced)}
        </span>
        <span className="text-(--warning)">
          Por cobrar: {money.format(client.totalPending)}
        </span>
      </div>
    </div>
  );
}

export default function TopClientes({ clients }) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-(--text)">
          Facturación Clientes
        </h2>
      </div>

      {clients.length === 0 ? (
        <p className="text-sm text-(--muted)">
          Aún no hay datos. Crea un proyecto o servicio para comenzar.
        </p>
      ) : (
        <div className="space-y-3">
          {clients.map((client, index) => (
            <ClientBar
              key={client.id}
              client={{ ...client, name: `${index + 1}. ${client.name}` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
