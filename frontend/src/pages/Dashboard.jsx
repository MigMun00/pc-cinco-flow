import { useDashboardAnalytics } from "../hooks/useDashboardAnalytics";
import DashboardKpis from "../components/DashboardKpis";
import TopClientes from "../components/TopClientes";
import PendingByClient from "../components/PendingByClient";

export default function Dashboard() {
  const { analytics, loading, error } = useDashboardAnalytics();

  if (loading)
    return <p className="text-sm text-(--muted)">Cargando dashboard...</p>;
  if (error) return <p className="text-sm text-(--danger)">{error}</p>;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-(--muted)">
          Resumen financiero
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-(--text) sm:text-3xl">
          Dashboard de Clientes e Ingresos
        </h1>
      </header>

      <DashboardKpis analytics={analytics} />

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <TopClientes clients={analytics.topClients} />
        <PendingByClient clients={analytics.clientsWithPending} />
      </section>
    </div>
  );
}
