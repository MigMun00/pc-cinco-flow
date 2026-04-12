export default function FormActions({ saving, isEdit, onCancel }) {
  return (
    <div className="flex gap-3 justify-end pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-sm text-(--muted) hover:text-(--text) transition-colors"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={saving}
        className="px-4 py-2 bg-(--primary) text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {saving ? "Guardando..." : isEdit ? "Guardar Cambios" : "Crear"}
      </button>
    </div>
  );
}
