import RowActions from "./RowActions";

export default function CrudTable({
  rows,
  columns,
  getRowKey,
  onEdit,
  onDelete,
  actionsWidthClass = "w-32",
}) {
  const hasActions = Boolean(onEdit || onDelete);
  const [primaryColumn, ...secondaryColumns] = columns;

  return (
    <div className="bg-(--surface) rounded-xl border border-(--border) overflow-hidden">
      <div className="divide-y divide-(--border) md:hidden">
        {rows.map((row) => (
          <article key={getRowKey(row)} className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.18em] text-(--muted)">
                  {primaryColumn.header}
                </p>
                <div className="mt-1 text-sm font-medium text-(--text)">
                  {primaryColumn.render(row)}
                </div>
              </div>

              {hasActions && (
                <RowActions
                  onEdit={onEdit ? () => onEdit(row) : undefined}
                  onDelete={onDelete ? () => onDelete(row) : undefined}
                  mobileAlignLeft
                />
              )}
            </div>

            {secondaryColumns.length > 0 && (
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {secondaryColumns.map((column) => (
                  <div
                    key={`${column.key}-${getRowKey(row)}`}
                    className="min-w-0"
                  >
                    <dt className="text-[11px] uppercase tracking-[0.18em] text-(--muted)">
                      {column.header}
                    </dt>
                    <dd className="mt-1 text-sm text-(--text)">
                      {column.render(row)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-180 text-sm">
          <thead>
            <tr className="border-b border-(--border) text-left text-(--muted)">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 font-medium ${column.headerClassName ?? ""}`}
                >
                  {column.header}
                </th>
              ))}
              {hasActions && (
                <th className={`px-4 py-3 ${actionsWidthClass}`} />
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={getRowKey(row)}
                className="border-b border-(--border) last:border-0 hover:bg-(--background)/40 transition-colors"
              >
                {columns.map((column) => (
                  <td
                    key={`${column.key}-${getRowKey(row)}`}
                    className={`px-4 py-3 ${column.cellClassName ?? "text-(--muted)"}`}
                  >
                    {column.render(row)}
                  </td>
                ))}
                {hasActions && (
                  <td className="px-4 py-3">
                    <RowActions
                      onEdit={onEdit ? () => onEdit(row) : undefined}
                      onDelete={onDelete ? () => onDelete(row) : undefined}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
