import { useState, useEffect } from "react";
import { useAuth } from "@clerk/react";
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "../services/service";
import { getClients } from "../services/client";
import { fmtDate } from "../services/api";
import Field from "../components/Field";
import PageHeader from "../components/PageHeader";
import CrudState from "../components/CrudState";
import CrudTable from "../components/CrudTable";
import CrudFormModal from "../components/CrudFormModal";
import ClientSelectField from "../components/ClientSelectField";
import InvoicedBadge from "../components/InvoicedBadge";

const EMPTY_SERVICE = {
  name: "",
  description: "",
  client_id: "",
  amount: "",
  invoiced: false,
};

export default function Services() {
  const { getToken } = useAuth();
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const [servicesData, clientsData] = await Promise.all([
        getServices(token),
        getClients(token),
      ]);
      setServices(servicesData);
      setClients(clientsData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function getClientName(clientId) {
    return clients.find((client) => client.id === clientId)?.name ?? "—";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const token = await getToken();
      const { id, ...fields } = modal;
      const amount = parseFloat(fields.amount);

      if (Number.isNaN(amount)) {
        throw new Error("El monto debe ser un numero valido.");
      }

      const payload = {
        ...fields,
        client_id: Number(fields.client_id),
        amount,
        description: fields.description || null,
      };

      if (id) {
        await updateService(token, id, payload);
      } else {
        await createService(token, payload);
      }

      await load();
      setModal(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(service) {
    if (!window.confirm(`¿Eliminar "${service.name}"?`)) return;

    try {
      const token = await getToken();
      await deleteService(token, service.id);
      setServices((previous) =>
        previous.filter((item) => item.id !== service.id),
      );
    } catch (e) {
      alert(e.message);
    }
  }

  const columns = [
    {
      key: "name",
      header: "Nombre",
      cellClassName: "text-(--text) font-medium",
      render: (service) => service.name,
    },
    {
      key: "client",
      header: "Cliente",
      render: (service) => getClientName(service.client_id),
    },
    {
      key: "description",
      header: "Descripcion",
      cellClassName: "text-(--muted) max-w-xs truncate",
      render: (service) => service.description ?? "—",
    },
    {
      key: "amount",
      header: "Monto",
      render: (service) => `$${service.amount.toFixed(2)}`,
    },
    {
      key: "invoiced",
      header: "Facturación",
      render: (service) => <InvoicedBadge invoiced={service.invoiced} />,
    },
    {
      key: "created",
      header: "Creado",
      render: (service) => fmtDate(service.created_at),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Servicios"
        action="+ Nuevo Servicio"
        onAction={() => setModal(EMPTY_SERVICE)}
      />

      <CrudState
        loading={loading}
        error={error}
        isEmpty={!loading && !error && services.length === 0}
        emptyMessage="No hay servicios aún. Agrega el primero."
      />

      {!loading && !error && services.length > 0 && (
        <CrudTable
          rows={services}
          columns={columns}
          getRowKey={(service) => service.id}
          onEdit={(service) =>
            setModal({
              id: service.id,
              name: service.name,
              description: service.description ?? "",
              client_id: service.client_id,
              amount: service.amount,
              invoiced: service.invoiced,
            })
          }
          onDelete={handleDelete}
        />
      )}

      {modal && (
        <CrudFormModal
          title={modal.id ? "Editar Servicio" : "Nuevo Servicio"}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          saving={saving}
          isEdit={Boolean(modal.id)}
        >
          <Field
            label="Nombre"
            value={modal.name}
            onChange={(value) => setModal((m) => ({ ...m, name: value }))}
            required
          />
          <Field
            label="Descripcion"
            value={modal.description}
            onChange={(value) =>
              setModal((m) => ({ ...m, description: value }))
            }
          />
          <ClientSelectField
            value={modal.client_id}
            clients={clients}
            onChange={(value) => setModal((m) => ({ ...m, client_id: value }))}
          />
          <Field
            label="Monto ($)"
            type="number"
            value={modal.amount}
            onChange={(value) => setModal((m) => ({ ...m, amount: value }))}
            required
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={modal.invoiced}
              onChange={(event) =>
                setModal((m) => ({ ...m, invoiced: event.target.checked }))
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
