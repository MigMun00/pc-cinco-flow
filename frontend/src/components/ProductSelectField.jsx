import { useMemo, useState } from "react";
import { money } from "../services/api";

export default function ProductSelectField({
  value,
  products,
  onChange,
  required = true,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const selectedProduct = products.find(
    (product) => String(product.id) === String(value),
  );
  const selectedLabel = selectedProduct
    ? `${selectedProduct.name} · ${money.format(selectedProduct.price)}`
    : "";
  const inputValue = isOpen ? searchTerm : selectedLabel;

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return products;

    return products.filter((product) => {
      const label = `${product.name} ${money.format(product.price)}`.toLowerCase();
      return label.includes(term);
    });
  }, [products, searchTerm]);

  function chooseProduct(product) {
    onChange(String(product.id));
    setSearchTerm("");
    setIsOpen(false);
  }

  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-(--muted) uppercase tracking-wide">
        Producto
      </span>
      <div className="relative">
        <input
          required={required}
          value={inputValue}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm("");
          }}
          onBlur={() =>
            setTimeout(() => {
              setIsOpen(false);
              setSearchTerm("");
            }, 120)
          }
          onChange={(event) => {
            const nextQuery = event.target.value;
            setSearchTerm(nextQuery);
            setIsOpen(true);

            if (!nextQuery.trim() || nextQuery !== selectedLabel) {
              onChange("");
            }
          }}
          placeholder="Busca un producto..."
          className="min-h-11 w-full bg-(--background) border border-(--border) rounded-lg px-3 py-2 text-sm text-(--text) focus:outline-none focus:border-(--primary) transition-colors"
        />

        {isOpen && (
          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-(--border) bg-(--surface) shadow-lg">
            {filteredProducts.length === 0 ? (
              <p className="px-3 py-2 text-sm text-(--muted)">Sin coincidencias.</p>
            ) : (
              filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onMouseDown={() => chooseProduct(product)}
                  className="block w-full px-3 py-2 text-left text-sm text-(--text) hover:bg-(--background)"
                >
                  {product.name} · {money.format(product.price)}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </label>
  );
}
