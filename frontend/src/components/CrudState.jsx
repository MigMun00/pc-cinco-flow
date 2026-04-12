export default function CrudState({ loading, error, isEmpty, emptyMessage }) {
  if (loading) {
    return <p className="text-(--muted) text-sm">Cargando...</p>;
  }

  if (error) {
    return <p className="text-(--danger) text-sm">{error}</p>;
  }

  if (isEmpty) {
    return <p className="text-(--muted) text-sm">{emptyMessage}</p>;
  }

  return null;
}
