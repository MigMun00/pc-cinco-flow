import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { getProjects } from "../services/project";
import { getClients } from "../services/client";
import {
  getProjectExpenses,
  createProjectExpense,
  updateProjectExpense,
  deleteProjectExpense,
} from "../services/projectExpense";
import Field from "../components/Field";
import CrudFormModal from "../components/CrudFormModal";
import CrudTable from "../components/CrudTable";
import { fmtDate } from "../services/api";

const EMPTY = { name: "", description: "", amount: "" };

export default function ProjectDetail() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const [project, setProject] = useState(null);
  const [clientName, setClientName] = useState("—");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // null | { id?, name, description, amount }
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const [projects, clients, allExpenses] = await Promise.all([
        getProjects(token),
        getClients(token),
        getProjectExpenses(token),
      ]);
      const found = projects.find((p) => p.id === Number(id));
      if (!found) throw new Error("Project not found");
      setProject(found);
      setClientName(clients.find((c) => c.id === found.client_id)?.name ?? "—");
      setExpenses(allExpenses.filter((e) => e.project_id === Number(id)));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await getToken();
      const { id: expenseId, ...fields } = modal;
      const payload = {
        ...fields,
        project_id: Number(id),
        amount: parseFloat(fields.amount),
        description: fields.description || null,
      };
      expenseId
        ? await updateProjectExpense(token, expenseId, payload)
        : await createProjectExpense(token, payload);
      await load();
      setModal(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete({ id: expenseId, name }) {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return;
    try {
      await deleteProjectExpense(await getToken(), expenseId);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    } catch (e) {
      alert(e.message);
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const baseCharge = totalExpenses * (1 + project?.win_margin / 100);
  const charge = baseCharge + (project?.custom_fee ?? 0);
  const profit = charge - totalExpenses;

  if (loading) return <p className="text-(--muted) text-sm">Cargando…</p>;
  if (error) return <p className="text-(--danger) text-sm">{error}</p>;

  const expenseColumns = [
    {
      key: "name",
      header: "Nombre",
      cellClassName: "text-(--text) font-medium",
      render: (expense) => expense.name,
    },
    {
      key: "description",
      header: "Descripción",
      cellClassName: "text-(--muted) max-w-xs truncate",
      render: (expense) => expense.description ?? "—",
    },
    {
      key: "amount",
      header: "Monto",
      render: (expense) => `$${expense.amount.toFixed(2)}`,
    },
    {
      key: "created",
      header: "Creado",
      render: (expense) => fmtDate(expense.created_at),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to="/projects"
          className="text-xs text-(--muted) hover:text-(--text) transition-colors"
        >
          ← Proyectos
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-(--text) sm:text-3xl">
          {project.name}
        </h1>
        <p className="text-sm text-(--muted) mt-0.5">{clientName}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <InfoCard
          label="Total Gastos"
          value={`$${totalExpenses.toFixed(2)}`}
          valueClass="text-(--danger)"
        />
        <InfoCard label="Margen de Ganancia" value={`${project.win_margin}%`} />
        <InfoCard
          label="Ganancia"
          value={`$${profit.toFixed(2)}`}
          valueClass="text-(--success)"
        />
        <InfoCard
          label="Cargo Adicional"
          value={`$${(project.custom_fee ?? 0).toFixed(2)}`}
          valueClass="text-(--success)"
        />
        <InfoCard
          label="Cobro"
          value={`$${charge.toFixed(2)}`}
          valueClass="text-(--success)"
        />
        <InfoCard
          label="Facturación"
          value={project.invoiced ? "Facturado" : "Pendiente"}
          valueClass={project.invoiced ? "text-(--success)" : "text-(--muted)"}
        />
      </div>

      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-(--text)">Gastos</h2>
          <button
            onClick={() => setModal(EMPTY)}
            className="w-full rounded-lg bg-(--primary) px-4 py-3 text-sm font-medium text-white hover:opacity-90 sm:w-auto"
          >
            + Agregar Gasto
          </button>
        </div>

        {expenses.length === 0 ? (
          <p className="text-(--muted) text-sm">Sin gastos aún.</p>
        ) : (
          <CrudTable
            rows={expenses}
            columns={expenseColumns}
            getRowKey={(expense) => expense.id}
            onEdit={(expense) =>
              setModal({
                id: expense.id,
                name: expense.name,
                description: expense.description ?? "",
                amount: expense.amount,
              })
            }
            onDelete={handleDelete}
          />
        )}
      </div>

      {modal && (
        <CrudFormModal
          title={modal.id ? "Editar Gasto" : "Nuevo Gasto"}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          saving={saving}
          isEdit={Boolean(modal.id)}
        >
          <Field
            label="Nombre"
            value={modal.name}
            onChange={(v) => setModal((m) => ({ ...m, name: v }))}
            required
          />
          <Field
            label="Descripción"
            value={modal.description}
            onChange={(v) => setModal((m) => ({ ...m, description: v }))}
          />
          <Field
            label="Monto ($)"
            type="number"
            value={modal.amount}
            onChange={(v) => setModal((m) => ({ ...m, amount: v }))}
            required
          />
        </CrudFormModal>
      )}
    </div>
  );
}

function InfoCard({ label, value, valueClass = "text-(--text)" }) {
  return (
    <div className="bg-(--surface) rounded-xl border border-(--border) px-4 py-3">
      <p className="text-xs text-(--muted) uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className={`text-lg font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}
