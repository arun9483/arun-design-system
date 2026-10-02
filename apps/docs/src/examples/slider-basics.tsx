import { useState } from 'react';
import { Slider } from '@arun-dev/ui';

const field = { display: 'grid', gap: 'var(--space-3xs)', maxInlineSize: '20rem' };

export default function SliderBasics() {
  const [volume, setVolume] = useState(40);
  return (
    <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
      <div style={field}>
        <label htmlFor="slider-volume">
          Volume <output htmlFor="slider-volume">{volume}</output>
        </label>
        <Slider
          id="slider-volume"
          name="volume"
          min={0}
          max={100}
          step={5}
          value={volume}
          onChange={(event) => setVolume(Number(event.target.value))}
        />
      </div>
      <div style={field}>
        <label htmlFor="slider-disabled">Disabled</label>
        <Slider id="slider-disabled" defaultValue={60} disabled />
      </div>
    </div>
  );
}
