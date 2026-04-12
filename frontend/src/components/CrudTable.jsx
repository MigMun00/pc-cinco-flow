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

  return (
    <div className="bg-(--surface) rounded-xl border border-(--border) overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-(--border) text-(--muted) text-left">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 font-medium ${column.headerClassName ?? ""}`}
              >
                {column.header}
              </th>
            ))}
            {hasActions && <th className={`px-4 py-3 ${actionsWidthClass}`} />}
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
  );
}
