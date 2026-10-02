import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Table } from './index';

describe('Table', () => {
  it('is a native table with column headers, in a scrolling container', () => {
    render(
      <Table.Root>
        <Table.Caption>Invoices</Table.Caption>
        <Table.Header>
          <Table.Row>
            <Table.Head>Number</Table.Head>
            <Table.Head aria-sort="ascending">
              <button type="button">Amount</button>
            </Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Head scope="row">INV-1</Table.Head>
            <Table.Cell>€40</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>,
    );
    const table = screen.getByRole('table', { name: 'Invoices' });
    expect(table).toHaveClass('table');
    expect(table.parentElement).toHaveClass('table-container');
    expect(screen.getByRole('columnheader', { name: 'Number' })).toHaveAttribute('scope', 'col');
    expect(screen.getByRole('rowheader', { name: 'INV-1' })).toHaveAttribute('scope', 'row');
    expect(screen.getByRole('cell', { name: '€40' })).toHaveClass('table-cell');
  });
});
