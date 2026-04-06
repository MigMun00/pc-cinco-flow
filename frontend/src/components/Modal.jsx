export default function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-(--surface) rounded-xl border border-(--border) p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold text-(--text) mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
