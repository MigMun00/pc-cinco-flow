export default function ClientSelectField({
  value,
  clients,
  onChange,
  required = true,
  label = "Cliente",
  placeholder = "Selecciona un cliente...",
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-(--muted) uppercase tracking-wide">
        {label}
      </span>
      <select
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 bg-(--background) border border-(--border) rounded-lg px-3 py-2 text-sm text-(--text) focus:outline-none focus:border-(--primary) transition-colors"
      >
        <option value="">{placeholder}</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>
    </label>
  );
}
