import { useState } from 'react';
import { RangeSlider } from '@arun-dev/ui';

const money = (n: number) => `$${n}`;

// A price filter: the group is named by its label, each thumb by its own name, and the range is
// shown in an <output> beside the label.
export default function RangeSliderPrice() {
  const [price, setPrice] = useState<readonly [number, number]>([200, 800]);
  return (
    <div style={{ display: 'grid', gap: 'var(--space-2xs)', maxInlineSize: '20rem' }}>
      <span id="range-slider-price">
        Price{' '}
        <output>
          {money(price[0])} – {money(price[1])}
        </output>
      </span>
      <RangeSlider.Root
        aria-labelledby="range-slider-price"
        min={0}
        max={1000}
        step={10}
        value={price}
        onValueChange={setPrice}
      >
        <RangeSlider.StartInput
          aria-label="Minimum price"
          aria-valuetext={money(price[0])}
          name="priceMin"
        />
        <RangeSlider.EndInput
          aria-label="Maximum price"
          aria-valuetext={money(price[1])}
          name="priceMax"
        />
      </RangeSlider.Root>
    </div>
  );
}
