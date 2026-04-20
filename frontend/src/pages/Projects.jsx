import { useState, useEffect, useCallback } from "react";
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
import Field from "../components/Field";
import PageHeader from "../components/PageHeader";
import CrudState from "../components/CrudState";
import InvoicedBadge from "../components/InvoicedBadge";
import ClientSelectField from "../components/ClientSelectField";
import CrudTable from "../components/CrudTable";
import CrudFormModal from "../components/CrudFormModal";

const EMPTY = {
  name: "",
  description: "",
  client_id: "",
  win_margin: "",
  custom_fee: "",
  invoiced: false,
};

export default function Projects() {
  const { getToken } = useAuth();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [clientFilter, setClientFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // null | { id?, ...fields }
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
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
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  function clientName(id) {
    return clients.find((c) => c.id === id)?.name ?? "—";
  }

  function projectCharge(p) {
    const total = expenses
      .filter((e) => e.project_id === p.id)
      .reduce((sum, e) => sum + e.amount, 0);
    return total * (1 + p.win_margin / 100) + (p.custom_fee ?? 0);
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
        custom_fee: parseFloat(fields.custom_fee) || 0,
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

  const columns = [
    {
      key: "name",
      header: "Nombre",
      cellClassName: "font-medium",
      render: (project) => (
        <Link
          to={`/projects/${project.id}`}
          className="text-(--primary) hover:underline"
        >
          {project.name}
        </Link>
      ),
    },
    {
      key: "client",
      header: "Cliente",
      render: (project) => clientName(project.client_id),
    },
    {
      key: "description",
      header: "Descripcion",
      cellClassName: "text-(--muted) max-w-xs truncate",
      render: (project) => project.description ?? "—",
    },
    {
      key: "charge",
      header: "Cobro",
      render: (project) => `$${projectCharge(project).toFixed(2)}`,
    },
    {
      key: "invoiced",
      header: "Facturación",
      render: (project) => <InvoicedBadge invoiced={project.invoiced} />,
    },
    {
      key: "created",
      header: "Creado",
      render: (project) => fmtDate(project.created_at),
    },
  ];

  const filteredProjects = projects.filter(
    (project) => !clientFilter || String(project.client_id) === clientFilter,
  );
  const pendingProjects = filteredProjects.filter(
    (project) => !project.invoiced,
  );
  const invoicedProjects = filteredProjects.filter(
    (project) => project.invoiced,
  );

  return (
    <div>
      <PageHeader
        title="Proyectos"
        action="+ Nuevo Proyecto"
        onAction={() => setModal(EMPTY)}
      />

      <div className="mb-6 max-w-sm">
        <ClientSelectField
          value={clientFilter}
          clients={clients}
          onChange={setClientFilter}
          required={false}
          label="Filtrar por cliente"
          placeholder="Todos los clientes"
        />
      </div>

      <CrudState
        loading={loading}
        error={error}
        isEmpty={!loading && !error && projects.length === 0}
        emptyMessage="No hay proyectos aún. Agrega el primero."
      />

      {!loading && !error && projects.length > 0 && (
        <div className="space-y-8">
          {filteredProjects.length === 0 && (
            <p className="text-sm text-(--muted)">
              No hay proyectos para el cliente seleccionado.
            </p>
          )}

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-(--text)">
                Pendientes por facturar
              </h2>
            </div>

            {pendingProjects.length > 0 ? (
              <CrudTable
                rows={pendingProjects}
                columns={columns}
                getRowKey={(project) => project.id}
                onEdit={(project) =>
                  setModal({
                    id: project.id,
                    name: project.name,
                    description: project.description ?? "",
                    client_id: project.client_id,
                    win_margin: project.win_margin,
                    custom_fee: project.custom_fee ?? 0,
                    invoiced: project.invoiced,
                  })
                }
                onDelete={handleDelete}
              />
            ) : (
              <p className="text-sm text-(--muted)">
                No hay proyectos pendientes por facturar.
              </p>
            )}
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-(--text)">
                Historial facturado
              </h2>
            </div>

            {invoicedProjects.length > 0 ? (
              <CrudTable
                rows={invoicedProjects}
                columns={columns}
                getRowKey={(project) => project.id}
                onEdit={(project) =>
                  setModal({
                    id: project.id,
                    name: project.name,
                    description: project.description ?? "",
                    client_id: project.client_id,
                    win_margin: project.win_margin,
                    custom_fee: project.custom_fee ?? 0,
                    invoiced: project.invoiced,
                  })
                }
                onDelete={handleDelete}
              />
            ) : (
              <p className="text-sm text-(--muted)">
                Aún no hay proyectos facturados en el historial.
              </p>
            )}
          </section>
        </div>
      )}

      {modal && (
        <CrudFormModal
          title={modal.id ? "Editar Proyecto" : "Nuevo Proyecto"}
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
            label="Descripcion"
            value={modal.description}
            onChange={(v) => setModal((m) => ({ ...m, description: v }))}
          />
          <ClientSelectField
            value={modal.client_id}
            clients={clients}
            onChange={(value) => setModal((m) => ({ ...m, client_id: value }))}
          />
          <Field
            label="Margen de Ganancia (%)"
            type="number"
            value={modal.win_margin}
            onChange={(v) => setModal((m) => ({ ...m, win_margin: v }))}
            required
          />
          <Field
            label="Cargo Adicional ($)"
            type="number"
            value={modal.custom_fee}
            onChange={(v) => setModal((m) => ({ ...m, custom_fee: v }))}
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
        </CrudFormModal>
      )}
    </div>
  );
}
