export default function InvoicedBadge({ invoiced }) {
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${invoiced ? "bg-green-900/40 text-(--success)" : "bg-(--background) text-(--muted)"}`}
    >
      {invoiced ? "Facturado" : "Pendiente"}
    </span>
  );
}
