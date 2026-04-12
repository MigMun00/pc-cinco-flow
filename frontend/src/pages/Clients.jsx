import { useState, useEffect } from "react";
import { useAuth } from "@clerk/react";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from "../services/client";
import Modal from "../components/Modal";
import Field from "../components/Field";
import PageHeader from "../components/PageHeader";
import RowActions from "../components/RowActions";

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

  return (
    <div>
      <PageHeader
        title="Clientes"
        action="+ Nuevo Cliente"
        onAction={() => setModal(EMPTY)}
      />

      {loading && <p className="text-(--muted) text-sm">Cargando…</p>}
      {error && <p className="text-(--danger) text-sm">{error}</p>}
      {!loading && !error && clients.length === 0 && (
        <p className="text-(--muted) text-sm">
          No hay clientes aún. Agrega el primero.
        </p>
      )}

      {!loading && !error && clients.length > 0 && (
        <div className="bg-(--surface) rounded-xl border border-(--border) overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--border) text-(--muted) text-left">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Correo</th>
                <th className="px-4 py-3 font-medium">Teléfono</th>
                <th className="px-4 py-3 w-32" />
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-(--border) last:border-0 hover:bg-(--background)/40 transition-colors"
                >
                  <td className="px-4 py-3 text-(--text) font-medium">
                    {c.name}
                  </td>
                  <td className="px-4 py-3 text-(--muted)">{c.email ?? "—"}</td>
                  <td className="px-4 py-3 text-(--muted)">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <RowActions
                      onEdit={() =>
                        setModal({
                          id: c.id,
                          name: c.name,
                          email: c.email ?? "",
                          phone: c.phone ?? "",
                        })
                      }
                      onDelete={() => handleDelete(c)}
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
          title={modal.id ? "Editar Cliente" : "Nuevo Cliente"}
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
              label="Correo"
              type="email"
              value={modal.email}
              onChange={(v) => setModal((m) => ({ ...m, email: v }))}
            />
            <Field
              label="Teléfono"
              value={modal.phone}
              onChange={(v) => setModal((m) => ({ ...m, phone: v }))}
            />
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
                className="px-4 py-2 bg-(--primary) text-(--text) text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
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
