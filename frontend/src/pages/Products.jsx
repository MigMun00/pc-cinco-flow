import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";

import Field from "../components/Field";
import CrudFormModal from "../components/CrudFormModal";
import CrudState from "../components/CrudState";
import CrudTable from "../components/CrudTable";
import PageHeader from "../components/PageHeader";
import { fmtDate, money } from "../services/api";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../services/product";

const EMPTY_PRODUCT = {
  name: "",
  price: "",
};

export default function Products() {
  const { getToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      setProducts(await getProducts(await getToken()));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);

    try {
      const token = await getToken();
      const { id, ...fields } = modal;
      const price = parseFloat(fields.price);

      if (Number.isNaN(price)) {
        throw new Error("El precio debe ser un numero valido.");
      }

      const payload = {
        name: fields.name,
        price,
      };

      if (id) {
        await updateProduct(token, id, payload);
      } else {
        await createProduct(token, payload);
      }

      await load();
      setModal(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`¿Eliminar "${product.name}"?`)) return;

    try {
      await deleteProduct(await getToken(), product.id);
      setProducts((previous) => previous.filter((item) => item.id !== product.id));
    } catch (e) {
      alert(e.message);
    }
  }

  const columns = [
    {
      key: "name",
      header: "Nombre",
      cellClassName: "text-(--text) font-medium",
      render: (product) => product.name,
    },
    {
      key: "price",
      header: "Precio",
      render: (product) => money.format(product.price),
    },
    {
      key: "created",
      header: "Creado",
      render: (product) => fmtDate(product.created_at),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Productos"
        action="+ Nuevo Producto"
        onAction={() => setModal(EMPTY_PRODUCT)}
      />

      <CrudState
        loading={loading}
        error={error}
        isEmpty={!loading && !error && products.length === 0}
        emptyMessage="No hay productos aún. Agrega el primero."
      />

      {!loading && !error && products.length > 0 && (
        <CrudTable
          rows={products}
          columns={columns}
          getRowKey={(product) => product.id}
          onEdit={(product) =>
            setModal({
              id: product.id,
              name: product.name,
              price: product.price,
            })
          }
          onDelete={handleDelete}
        />
      )}

      {modal && (
        <CrudFormModal
          title={modal.id ? "Editar Producto" : "Nuevo Producto"}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          saving={saving}
          isEdit={Boolean(modal.id)}
        >
          <Field
            label="Nombre"
            value={modal.name}
            onChange={(value) => setModal((current) => ({ ...current, name: value }))}
            required
          />
          <Field
            label="Precio ($)"
            type="number"
            value={modal.price}
            onChange={(value) => setModal((current) => ({ ...current, price: value }))}
            min="0"
            step="0.01"
            required
          />
        </CrudFormModal>
      )}
    </div>
  );
}