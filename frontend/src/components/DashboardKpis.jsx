import { money } from "../services/api";

const TONE_CLASSES = {
  success: "text-(--success)",
  warning: "text-(--warning)",
  neutral: "text-(--text)",
};

function KpiCard({ label, value, tone }) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-4">
      <p className="text-xs uppercase tracking-wide text-(--muted)">{label}</p>
      <p className={`mt-2 text-xl font-semibold ${TONE_CLASSES[tone]}`}>
        {value}
      </p>
    </div>
  );
}

export default function DashboardKpis({ analytics }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Ingresos Facturados"
        value={money.format(analytics.totalInvoicedIncome)}
        tone="success"
      />
      <KpiCard
        label="Por Facturar"
        value={money.format(analytics.totalPendingIncome)}
        tone="warning"
      />
      <KpiCard
        label="Ingreso Potencial"
        value={money.format(analytics.totalPotentialIncome)}
        tone="neutral"
      />
      <KpiCard
        label="Clientes Activos"
        value={analytics.activeClients}
        tone="neutral"
      />
    </section>
  );
}
