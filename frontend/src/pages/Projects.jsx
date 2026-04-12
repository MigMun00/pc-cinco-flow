import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/react";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../services/project";
import { getClients } from "../services/client";
import { getProjectExpenses } from "../services/projectExpense";
import { fmtDate } from "../services/api";
import Modal from "../components/Modal";
import Field from "../components/Field";
import PageHeader from "../components/PageHeader";
import RowActions from "../components/RowActions";

const EMPTY = {
  name: "",
  description: "",
  client_id: "",
  win_margin: "",
  invoiced: false,
};

export default function Projects() {
  const { getToken } = useAuth();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // null | { id?, ...fields }
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const [projectsData, clientsData, expensesData] = await Promise.all([
        getProjects(token),
        getClients(token),
        getProjectExpenses(token),
      ]);
      setProjects(projectsData);
      setClients(clientsData);
      setExpenses(expensesData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function clientName(id) {
    return clients.find((c) => c.id === id)?.name ?? "—";
  }

  function projectCharge(p) {
    const total = expenses
      .filter((e) => e.project_id === p.id)
      .reduce((sum, e) => sum + e.amount, 0);
    return total * (1 + p.win_margin / 100);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await getToken();
      const { id, ...fields } = modal;
      const payload = {
        ...fields,
        client_id: Number(fields.client_id),
        win_margin: parseFloat(fields.win_margin),
        description: fields.description || null,
      };
      id
        ? await updateProject(token, id, payload)
        : await createProject(token, payload);
      await load();
      setModal(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete({ id, name }) {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return;
    try {
      await deleteProject(await getToken(), id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Proyectos"
        action="+ Nuevo Proyecto"
        onAction={() => setModal(EMPTY)}
      />

      {loading && <p className="text-(--muted) text-sm">Cargando…</p>}
      {error && <p className="text-(--danger) text-sm">{error}</p>}
      {!loading && !error && projects.length === 0 && (
        <p className="text-(--muted) text-sm">
          No hay proyectos aún. Agrega el primero.
        </p>
      )}

      {!loading && !error && projects.length > 0 && (
        <div className="bg-(--surface) rounded-xl border border-(--border) overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--border) text-(--muted) text-left">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Descripción</th>
                <th className="px-4 py-3 font-medium">Cobro</th>
                <th className="px-4 py-3 font-medium">Facturado</th>
                <th className="px-4 py-3 font-medium">Creado</th>
                <th className="px-4 py-3 w-32" />
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-(--border) last:border-0 hover:bg-(--background)/40 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">
                    <Link
                      to={`/projects/${p.id}`}
                      className="text-(--primary) hover:underline"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-(--muted)">
                    {clientName(p.client_id)}
                  </td>
                  <td className="px-4 py-3 text-(--muted) max-w-xs truncate">
                    {p.description ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-(--muted)">
                    ${projectCharge(p).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.invoiced ? "bg-green-900/40 text-(--success)" : "bg-(--background) text-(--muted)"}`}
                    >
                      {p.invoiced ? "Facturado" : "Pendiente"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-(--muted)">
                    {fmtDate(p.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <RowActions
                      onEdit={() =>
                        setModal({
                          id: p.id,
                          name: p.name,
                          description: p.description ?? "",
                          client_id: p.client_id,
                          win_margin: p.win_margin,
                          invoiced: p.invoiced,
                        })
                      }
                      onDelete={() => handleDelete(p)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal
          title={modal.id ? "Editar Proyecto" : "Nuevo Proyecto"}
          onClose={() => setModal(null)}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-(--muted) uppercase tracking-wide">
                Cliente
              </span>
              <select
                required
                value={modal.client_id}
                onChange={(e) =>
                  setModal((m) => ({ ...m, client_id: e.target.value }))
                }
                className="bg-(--background) border border-(--border) rounded-lg px-3 py-2 text-sm text-(--text) focus:outline-none focus:border-(--primary) transition-colors"
              >
                <option value="">Selecciona un cliente…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="Margen de Ganancia (%)"
              type="number"
              value={modal.win_margin}
              onChange={(v) => setModal((m) => ({ ...m, win_margin: v }))}
              required
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={modal.invoiced}
                onChange={(e) =>
                  setModal((m) => ({ ...m, invoiced: e.target.checked }))
                }
                className="w-4 h-4 accent-(--primary)"
              />
              <span className="text-sm text-(--text)">Facturado</span>
            </label>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="px-4 py-2 text-sm text-(--muted) hover:text-(--text) transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-(--primary) text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {saving ? "Guardando…" : modal.id ? "Guardar Cambios" : "Crear"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
