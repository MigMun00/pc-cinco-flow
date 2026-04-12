export default function RowActions({ onEdit, onDelete }) {
  return (
    <div className="flex gap-2 justify-end">
      <button
        onClick={onEdit}
        className="px-3 py-1 text-xs rounded-md bg-(--background) text-(--muted) hover:text-(--text) border border-(--border) transition-colors"
      >
        Editar
      </button>
      <button
        onClick={onDelete}
        className="px-3 py-1 text-xs rounded-md text-(--danger) hover:bg-(--danger) hover:text-(--text) border border-(--danger) transition-colors"
      >
        Eliminar
      </button>
    </div>
  );
}
