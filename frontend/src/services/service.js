import { apiFetch } from "./api";

export const getServices = (token) =>
  apiFetch("/services/", token);

export const createService = (token, payload) =>
  apiFetch("/services/", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateService = (token, id, payload) =>
  apiFetch(`/services/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteService = (token, id) =>
  apiFetch(`/services/${id}`, token, { method: "DELETE" });
