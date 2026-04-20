export default function FormActions({ saving, isEdit, onCancel }) {
  return (
    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        className="w-full px-4 py-3 text-sm text-(--muted) transition-colors hover:text-(--text) sm:w-auto"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-(--primary) px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:w-auto"
      >
        {saving ? "Guardando..." : isEdit ? "Guardar Cambios" : "Crear"}
      </button>
    </div>
  );
}
