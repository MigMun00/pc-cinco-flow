import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { getProjects } from "../services/project";
import { getClients } from "../services/client";
import {
  getProjectExpenses,
  createProjectExpense,
  updateProjectExpense,
  deleteProjectExpense,
} from "../services/projectExpense";
import Modal from "../components/Modal";
import Field from "../components/Field";
import RowActions from "../components/RowActions";
import { fmtDate } from "../services/api";

const EMPTY = { name: "", description: "", amount: "" };

export default function ProjectDetail() {
  const { id } = useParams();
  const { getToken } = useAuth();
  const [project, setProject] = useState(null);
  const [clientName, setClientName] = useState("—");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null); // null | { id?, name, description, amount }
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      const [projects, clients, allExpenses] = await Promise.all([
        getProjects(token),
        getClients(token),
        getProjectExpenses(token),
      ]);
      const found = projects.find((p) => p.id === Number(id));
      if (!found) throw new Error("Project not found");
      setProject(found);
      setClientName(clients.find((c) => c.id === found.client_id)?.name ?? "—");
      setExpenses(allExpenses.filter((e) => e.project_id === Number(id)));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await getToken();
      const { id: expenseId, ...fields } = modal;
      const payload = {
        ...fields,
        project_id: Number(id),
        amount: parseFloat(fields.amount),
        description: fields.description || null,
      };
      expenseId
        ? await updateProjectExpense(token, expenseId, payload)
        : await createProjectExpense(token, payload);
      await load();
      setModal(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete({ id: expenseId, name }) {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteProjectExpense(await getToken(), expenseId);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    } catch (e) {
      alert(e.message);
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const charge = totalExpenses * (1 + project?.win_margin / 100);
  const profit = charge - totalExpenses;

  if (loading) return <p className="text-(--muted) text-sm">Loading…</p>;
  if (error) return <p className="text-(--danger) text-sm">{error}</p>;

  return (
    <div className="flex flex-col gap-6">
      {/* Back + title */}
      <div>
        <Link
          to="/projects"
          className="text-xs text-(--muted) hover:text-(--text) transition-colors"
        >
          ← Projects
        </Link>
        <h1 className="text-xl font-semibold text-(--text) mt-1">
          {project.name}
        </h1>
        <p className="text-sm text-(--muted) mt-0.5">{clientName}</p>
      </div>

      {/* Project info cards */}
      <div className="grid grid-cols-3 gap-4">
        <InfoCard
          label="Total Expenses"
          value={`$${totalExpenses.toFixed(2)}`}
          valueClass="text-(--danger)"
        />
        <InfoCard label="Win Margin" value={`${project.win_margin}%`} />
        <InfoCard
          label="Profit"
          value={`$${profit.toFixed(2)}`}
          valueClass="text-(--success)"
        />
        <InfoCard
          label="Charge"
          value={`$${charge.toFixed(2)}`}
          valueClass="text-(--success)"
        />
        <InfoCard
          label="Status"
          value={project.invoiced ? "Invoiced" : "Pending"}
          valueClass={project.invoiced ? "text-(--success)" : "text-(--muted)"}
        />
      </div>

      {/* Expenses section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-(--text)">Expenses</h2>
          <button
            onClick={() => setModal(EMPTY)}
            className="px-4 py-2 bg-(--primary) text-white text-sm font-medium rounded-lg hover:opacity-90"
          >
            + Add Expense
          </button>
        </div>

        {expenses.length === 0 ? (
          <p className="text-(--muted) text-sm">No expenses yet.</p>
        ) : (
          <div className="bg-(--surface) rounded-xl border border-(--border) overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--border) text-(--muted) text-left">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 w-32" />
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className="border-b border-(--border) last:border-0 hover:bg-(--background)/40 transition-colors"
                  >
                    <td className="px-4 py-3 text-(--text) font-medium">
                      {exp.name}
                    </td>
                    <td className="px-4 py-3 text-(--muted)">
                      {exp.description ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-(--muted)">
                      ${exp.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-(--muted)">
                      {fmtDate(exp.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <RowActions
                        onEdit={() =>
                          setModal({
                            id: exp.id,
                            name: exp.name,
                            description: exp.description ?? "",
                            amount: exp.amount,
                          })
                        }
                        onDelete={() => handleDelete(exp)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <Modal
          title={modal.id ? "Edit Expense" : "New Expense"}
          onClose={() => setModal(null)}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field
              label="Name"
              value={modal.name}
              onChange={(v) => setModal((m) => ({ ...m, name: v }))}
              required
            />
            <Field
              label="Description"
              value={modal.description}
              onChange={(v) => setModal((m) => ({ ...m, description: v }))}
            />
            <Field
              label="Amount ($)"
              type="number"
              value={modal.amount}
              onChange={(v) => setModal((m) => ({ ...m, amount: v }))}
              required
            />
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="px-4 py-2 text-sm text-(--muted) hover:text-(--text) transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-(--primary) text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {saving ? "Saving…" : modal.id ? "Save Changes" : "Add"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function InfoCard({ label, value, valueClass = "text-(--text)" }) {
  return (
    <div className="bg-(--surface) rounded-xl border border-(--border) px-4 py-3">
      <p className="text-xs text-(--muted) uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className={`text-lg font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}
