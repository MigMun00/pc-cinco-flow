import { money } from "../services/api";

export default function ProductSelectField({
  value,
  products,
  onChange,
  required = true,
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-(--muted) uppercase tracking-wide">
        Producto
      </span>
      <select
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="bg-(--background) border border-(--border) rounded-lg px-3 py-2 text-sm text-(--text) focus:outline-none focus:border-(--primary) transition-colors"
      >
        <option value="">Selecciona un producto...</option>
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name} · {money.format(product.price)}
          </option>
        ))}
      </select>
    </label>
  );
}