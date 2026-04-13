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
      header: "Facturado",
      render: (project) => <InvoicedBadge invoiced={project.invoiced} />,
    },
    {
      key: "created",
      header: "Creado",
      render: (project) => fmtDate(project.created_at),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Proyectos"
        action="+ Nuevo Proyecto"
        onAction={() => setModal(EMPTY)}
      />

      <CrudState
        loading={loading}
        error={error}
        isEmpty={!loading && !error && projects.length === 0}
        emptyMessage="No hay proyectos aún. Agrega el primero."
      />

      {!loading && !error && projects.length > 0 && (
        <CrudTable
          rows={projects}
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
