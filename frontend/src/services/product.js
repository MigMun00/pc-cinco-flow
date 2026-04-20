import { apiFetch } from "./api";

export const getProducts = (token) => apiFetch("/products/", token);

export const createProduct = (token, payload) =>
  apiFetch("/products/", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateProduct = (token, id, payload) =>
  apiFetch(`/products/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteProduct = (token, id) =>
  apiFetch(`/products/${id}`, token, { method: "DELETE" });