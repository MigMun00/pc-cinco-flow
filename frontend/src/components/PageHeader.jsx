export default function PageHeader({ title, action, onAction }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-xl font-semibold text-(--text) sm:text-2xl">
        {title}
      </h1>
      <button
        onClick={onAction}
        className="w-full rounded-lg bg-(--primary) px-4 py-3 text-sm font-medium text-(--text) hover:opacity-90 sm:w-auto"
      >
        {action}
      </button>
    </div>
  );
}
