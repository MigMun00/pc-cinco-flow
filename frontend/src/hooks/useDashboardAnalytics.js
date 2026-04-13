import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/react";
import { getClients } from "../services/client";
import { getProjects } from "../services/project";
import { getServices } from "../services/service";
import { getProjectExpenses } from "../services/projectExpense";

export function useDashboardAnalytics() {
  const { getToken } = useAuth();
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [projectExpenses, setProjectExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        const [clientsData, projectsData, servicesData, expensesData] =
          await Promise.all([
            getClients(token),
            getProjects(token),
            getServices(token),
            getProjectExpenses(token),
          ]);
        setClients(clientsData);
        setProjects(projectsData);
        setServices(servicesData);
        setProjectExpenses(expensesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const analytics = useMemo(() => {
    const clientStats = new Map(
      clients.map((client) => [
        client.id,
        {
          id: client.id,
          name: client.name,
          totalInvoiced: 0,
          totalPending: 0,
          pendingProjects: [],
          pendingServices: [],
          pendingProjectsCount: 0,
          pendingServicesCount: 0,
        },
      ]),
    );

    const expensesByProject = projectExpenses.reduce((acc, expense) => {
      acc.set(
        expense.project_id,
        (acc.get(expense.project_id) ?? 0) + expense.amount,
      );
      return acc;
    }, new Map());

    const projectCharge = (project) => {
      const expenses = expensesByProject.get(project.id) ?? 0;
      return (
        expenses * (1 + project.win_margin / 100) + (project.custom_fee ?? 0)
      );
    };

    let totalInvoicedIncome = 0;
    let totalPendingIncome = 0;
    let projectsPendingCount = 0;
    let servicesPendingCount = 0;

    for (const project of projects) {
      const charge = projectCharge(project);
      const stat = clientStats.get(project.client_id);
      if (!stat) continue;

      if (project.invoiced) {
        stat.totalInvoiced += charge;
        totalInvoicedIncome += charge;
      } else {
        stat.totalPending += charge;
        stat.pendingProjectsCount += 1;
        stat.pendingProjects.push({
          id: project.id,
          name: project.name,
          amount: charge,
        });
        totalPendingIncome += charge;
        projectsPendingCount += 1;
      }
    }

    for (const service of services) {
      const stat = clientStats.get(service.client_id);
      if (!stat) continue;

      if (service.invoiced) {
        stat.totalInvoiced += service.amount;
        totalInvoicedIncome += service.amount;
      } else {
        stat.totalPending += service.amount;
        stat.pendingServicesCount += 1;
        stat.pendingServices.push({
          id: service.id,
          name: service.name,
          amount: service.amount,
        });
        totalPendingIncome += service.amount;
        servicesPendingCount += 1;
      }
    }

    const allClientStats = Array.from(clientStats.values()).map((c) => ({
      ...c,
      totalPotential: c.totalInvoiced + c.totalPending,
    }));

    const totalPotentialIncome = totalInvoicedIncome + totalPendingIncome;

    return {
      totalInvoicedIncome,
      totalPendingIncome,
      totalPotentialIncome,
      projectsPendingCount,
      servicesPendingCount,
      activeClients: allClientStats.filter((c) => c.totalPotential > 0).length,
      invoiceCoverage:
        totalPotentialIncome === 0
          ? 0
          : (totalInvoicedIncome / totalPotentialIncome) * 100,
      topClients: [...allClientStats]
        .filter((c) => c.totalPotential > 0)
        .sort((a, b) => b.totalPending - a.totalPending)
        .slice(0, 5),
      clientsWithPending: allClientStats
        .filter((c) => c.totalPending > 0)
        .sort((a, b) => b.totalPending - a.totalPending),
    };
  }, [clients, projects, services, projectExpenses]);

  return { analytics, loading, error };
}
