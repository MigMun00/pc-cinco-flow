export default function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  step,
  min,
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-(--muted) uppercase tracking-wide">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        step={step}
        min={min}
        className="bg-(--background) border border-(--border) rounded-lg px-3 py-2 text-sm text-(--text) focus:outline-none focus:border-(--primary) transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      />
    </label>
  );
}
