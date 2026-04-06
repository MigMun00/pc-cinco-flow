import { apiFetch } from "./api";

export const getClients = (token) =>
  apiFetch("/clients/", token);

export const createClient = (token, payload) =>
  apiFetch("/clients/", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateClient = (token, id, payload) =>
  apiFetch(`/clients/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteClient = (token, id) =>
  apiFetch(`/clients/${id}`, token, { method: "DELETE" });
