import { useState, useEffect } from "react";
import { useAuth } from "@clerk/react";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from "../services/client";
import Field from "../components/Field";
import PageHeader from "../components/PageHeader";
import CrudState from "../components/CrudState";
import CrudTable from "../components/CrudTable";
import CrudFormModal from "../components/CrudFormModal";

const EMPTY = { name: "", email: "", phone: "" };

export default function Clients() {
  const { getToken } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      setClients(await getClients(await getToken()));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await getToken();
      const { id, ...fields } = modal;
      const payload = {
        ...fields,
        email: fields.email || null,
        phone: fields.phone || null,
      };
      id
        ? await updateClient(token, id, payload)
        : await createClient(token, payload);
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
      await deleteClient(await getToken(), id);
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      alert(e.message);
    }
  }

  const columns = [
    {
      key: "name",
      header: "Nombre",
      cellClassName: "text-(--text) font-medium",
      render: (client) => client.name,
    },
    {
      key: "email",
      header: "Correo",
      render: (client) => client.email ?? "—",
    },
    {
      key: "phone",
      header: "Telefono",
      render: (client) => client.phone ?? "—",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Clientes"
        action="+ Nuevo Cliente"
        onAction={() => setModal(EMPTY)}
      />

      <CrudState
        loading={loading}
        error={error}
        isEmpty={!loading && !error && clients.length === 0}
        emptyMessage="No hay clientes aún. Agrega el primero."
      />

      {!loading && !error && clients.length > 0 && (
        <CrudTable
          rows={clients}
          columns={columns}
          getRowKey={(client) => client.id}
          onEdit={(client) =>
            setModal({
              id: client.id,
              name: client.name,
              email: client.email ?? "",
              phone: client.phone ?? "",
            })
          }
          onDelete={handleDelete}
        />
      )}

      {modal && (
        <CrudFormModal
          title={modal.id ? "Editar Cliente" : "Nuevo Cliente"}
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
            label="Correo"
            type="email"
            value={modal.email}
            onChange={(v) => setModal((m) => ({ ...m, email: v }))}
          />
          <Field
            label="Telefono"
            value={modal.phone}
            onChange={(v) => setModal((m) => ({ ...m, phone: v }))}
          />
        </CrudFormModal>
      )}
    </div>
  );
}
