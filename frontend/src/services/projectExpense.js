import { apiFetch } from "./api";

export const getProjectExpenses = (token) =>
  apiFetch("/project-expenses/", token);

export const createProjectExpense = (token, payload) =>
  apiFetch("/project-expenses/", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateProjectExpense = (token, id, payload) =>
  apiFetch(`/project-expenses/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteProjectExpense = (token, id) =>
  apiFetch(`/project-expenses/${id}`, token, { method: "DELETE" });
