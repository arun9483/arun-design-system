import { useState } from 'react';
import { Combobox } from '@arun-dev/ui';

const field = { display: 'grid', gap: 'var(--space-3xs)', maxInlineSize: '24rem' };

type Product = { id: string; label: string };

const products: Product[] = [
  { id: 'book-atlas', label: 'Book: Atlas of Remote Islands' },
  { id: 'book-dune', label: 'Book: Dune' },
  { id: 'book-sapiens', label: 'Book: Sapiens' },
  { id: 'pen-ballpoint', label: 'Pen: Ballpoint' },
  { id: 'pen-fountain', label: 'Pen: Fountain' },
  { id: 'pen-gel', label: 'Pen: Gel' },
  { id: 'notebook-a5', label: 'Notebook: A5 dotted' },
];

// Search "book", pick some; search "pen", pick some. Every pick stays selected.
export default function ComboboxMultiple() {
  const [value, setValue] = useState<Product[]>([]);

  return (
    <div style={field}>
      <label htmlFor="combobox-products">Products</label>
      <Combobox.Root
        items={products}
        itemToKey={productId}
        multiple
        value={value}
        onValueChange={setValue}
        name="products"
      >
        <Combobox.Input
          id="combobox-products"
          placeholder={value.length > 0 ? undefined : 'Search products…'}
        />
        <Combobox.Popup>
          <Combobox.Empty>No products found.</Combobox.Empty>
          <Combobox.List>
            {(product: Product) => (
              <Combobox.Item key={product.id} value={product}>
                {product.label}
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Root>
      <small>Selected: {value.map((p) => p.id).join(', ') || 'none'}</small>
    </div>
  );
}

// Outside the component, so the Root sees the same function every render.
function productId(product: Product) {
  return product.id;
}
