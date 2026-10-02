import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Alert } from './index';

describe('Alert', () => {
  it('has no live role by default, and takes one when given', () => {
    const { rerender } = render(
      <Alert.Root data-testid="alert">
        <Alert.Title>Heads up</Alert.Title>
      </Alert.Root>,
    );
    expect(screen.getByTestId('alert')).not.toHaveAttribute('role');
    rerender(
      <Alert.Root role="alert" tone="error">
        <Alert.Title>Save failed</Alert.Title>
      </Alert.Root>,
    );
    expect(screen.getByRole('alert')).toHaveClass('alert', 'alert-error');
  });

  it('hides the icon from assistive technology, and styles its parts', () => {
    render(
      <Alert.Root tone="info" icon={<svg data-testid="icon" />}>
        <Alert.Title>New</Alert.Title>
        <Alert.Description>Groups landed in Combobox.</Alert.Description>
      </Alert.Root>,
    );
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('New')).toHaveClass('alert-title');
    expect(screen.getByText('Groups landed in Combobox.')).toHaveClass('alert-description');
  });
});
