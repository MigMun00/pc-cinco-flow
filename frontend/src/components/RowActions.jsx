export default function RowActions({
  onEdit,
  onDelete,
  mobileAlignLeft = false,
}) {
  return (
    <div
      className={`flex gap-2 ${
        mobileAlignLeft ? "justify-start" : "justify-end"
      }`}
    >
      {onEdit && (
        <button
          onClick={onEdit}
          className="rounded-md border border-(--border) bg-(--background) px-3 py-2 text-xs text-(--muted) transition-colors hover:text-(--text)"
        >
          Editar
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="rounded-md border border-(--danger) px-3 py-2 text-xs text-(--danger) transition-colors hover:bg-(--danger) hover:text-(--text)"
        >
          Eliminar
        </button>
      )}
    </div>
  );
}
