import { apiFetch } from "./api";

export const getProjects = (token) =>
  apiFetch("/projects/", token);

export const createProject = (token, payload) =>
  apiFetch("/projects/", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateProject = (token, id, payload) =>
  apiFetch(`/projects/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteProject = (token, id) =>
  apiFetch(`/projects/${id}`, token, { method: "DELETE" });
