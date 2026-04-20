export default function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/50 p-3 sm:items-center sm:justify-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-xl sm:p-6">
        <h2 className="mb-4 pr-8 text-lg font-semibold text-(--text)">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
