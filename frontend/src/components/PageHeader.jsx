export default function PageHeader({ title, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-xl font-semibold text-(--text)">{title}</h1>
      <button
        onClick={onAction}
        className="px-4 py-2 bg-(--primary) text-(--text) text-sm font-medium rounded-lg hover:opacity-90"
      >
        {action}
      </button>
    </div>
  );
}
