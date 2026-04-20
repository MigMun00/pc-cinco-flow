import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/react";
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "../services/service";
import { getClients } from "../services/client";
import { getProducts } from "../services/product";
import { fmtDate, money } from "../services/api";
import Field from "../components/Field";
import PageHeader from "../components/PageHeader";
import CrudState from "../components/CrudState";
import CrudTable from "../components/CrudTable";
import CrudFormModal from "../components/CrudFormModal";
import ClientSelectField from "../components/ClientSelectField";
import InvoicedBadge from "../components/InvoicedBadge";
import ProductSelectField from "../components/ProductSelectField";

const EMPTY_SERVICE = {
  name: "",
  description: "",
  client_id: "",
  amount: "",
  product_id: "",
  invoiced: false,
};

export default function Services() {
  const { getToken } = useAuth();
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const [servicesData, clientsData, productsData] = await Promise.all([
        getServices(token),
        getClients(token),
        getProducts(token),
      ]);
      setServices(servicesData);
      setClients(clientsData);
      setProducts(productsData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    load();
  }, [load]);

  function getClientName(clientId) {
    return clients.find((client) => client.id === clientId)?.name ?? "—";
  }

  function getProduct(productId) {
    return products.find((product) => product.id === productId) ?? null;
  }

  function handleProductChange(productId) {
    const nextProduct = getProduct(Number(productId));

    setModal((current) => ({
      ...current,
      product_id: productId,
      amount: nextProduct ? nextProduct.price : current.amount,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const token = await getToken();
      const { id, ...fields } = modal;
      const amount = parseFloat(fields.amount);

      if (!fields.product_id) {
        throw new Error("Selecciona un producto para el servicio.");
      }

      if (Number.isNaN(amount)) {
        throw new Error("El monto debe ser un numero valido.");
      }

      const payload = {
        ...fields,
        client_id: Number(fields.client_id),
        product_id: Number(fields.product_id),
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
      key: "product",
      header: "Producto",
      render: (service) => getProduct(service.product_id)?.name ?? "—",
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
      render: (service) => money.format(service.amount),
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

  const pendingServices = services.filter((service) => !service.invoiced);
  const invoicedServices = services.filter((service) => service.invoiced);

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
        <div className="space-y-8">
          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-(--text)">
                Pendientes por facturar
              </h2>
            </div>

            {pendingServices.length > 0 ? (
              <CrudTable
                rows={pendingServices}
                columns={columns}
                getRowKey={(service) => service.id}
                onEdit={(service) =>
                  setModal({
                    id: service.id,
                    name: service.name,
                    description: service.description ?? "",
                    client_id: service.client_id,
                    product_id: service.product_id ?? "",
                    amount: service.amount,
                    invoiced: service.invoiced,
                  })
                }
                onDelete={handleDelete}
              />
            ) : (
              <p className="text-sm text-(--muted)">
                No hay servicios pendientes por facturar.
              </p>
            )}
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-(--text)">
                Historial facturado
              </h2>
            </div>

            {invoicedServices.length > 0 ? (
              <CrudTable
                rows={invoicedServices}
                columns={columns}
                getRowKey={(service) => service.id}
                onEdit={(service) =>
                  setModal({
                    id: service.id,
                    name: service.name,
                    description: service.description ?? "",
                    client_id: service.client_id,
                    product_id: service.product_id ?? "",
                    amount: service.amount,
                    invoiced: service.invoiced,
                  })
                }
                onDelete={handleDelete}
              />
            ) : (
              <p className="text-sm text-(--muted)">
                Aún no hay servicios facturados en el historial.
              </p>
            )}
          </section>
        </div>
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
          <ProductSelectField
            value={modal.product_id}
            products={products}
            onChange={handleProductChange}
          />
          <Field
            label="Monto ($)"
            type="number"
            value={modal.amount}
            onChange={(value) => setModal((m) => ({ ...m, amount: value }))}
            disabled
            min="0"
            step="0.01"
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
