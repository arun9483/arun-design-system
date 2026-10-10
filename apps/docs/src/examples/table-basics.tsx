import { useState } from 'react';
import { Button } from '@arun-dev/headless/button';
import { Table } from '@arun-dev/ui';

const invoices = [
  { id: 'INV-1042', customer: 'Ada Lovelace', amount: 1200, status: 'Paid' },
  { id: 'INV-1043', customer: 'Alan Turing', amount: 450, status: 'Due' },
  { id: 'INV-1044', customer: 'Grace Hopper', amount: 3100, status: 'Paid' },
  { id: 'INV-1045', customer: 'Katherine Johnson', amount: 780, status: 'Overdue' },
];

type Sort = 'none' | 'ascending' | 'descending';
// Each press moves on: as received, then ascending, then descending, then back.
const next: Record<Sort, Sort> = { none: 'ascending', ascending: 'descending', descending: 'none' };

// Sorting is yours: a button in the header, and aria-sort on the header cell.
export default function TableBasics() {
  const [sort, setSort] = useState<Sort>('none');
  const rows =
    sort === 'none'
      ? invoices
      : [...invoices].sort((a, b) =>
          sort === 'ascending' ? a.amount - b.amount : b.amount - a.amount,
        );
  const total = invoices.reduce((sum, i) => sum + i.amount, 0);

  return (
    <Table.Root style={{ minInlineSize: '32rem' }}>
      <Table.Caption>Invoices this month</Table.Caption>
      <Table.Header>
        <Table.Row>
          <Table.Head>Invoice</Table.Head>
          <Table.Head>Customer</Table.Head>
          <Table.Head>Status</Table.Head>
          {/* No aria-sort while unsorted, so no arrow. */}
          <Table.Head aria-sort={sort === 'none' ? undefined : sort}>
            {/* Unstyled: the Head styles the button that fills it. */}
            <Button onClick={() => setSort(next[sort])}>Amount</Button>
          </Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {rows.map((invoice) => (
          <Table.Row key={invoice.id}>
            <Table.Head scope="row">{invoice.id}</Table.Head>
            <Table.Cell>{invoice.customer}</Table.Cell>
            <Table.Cell>{invoice.status}</Table.Cell>
            <Table.Cell>€{invoice.amount.toLocaleString('en')}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
      <Table.Footer>
        <Table.Row>
          <Table.Cell colSpan={3}>Total</Table.Cell>
          <Table.Cell>€{total.toLocaleString('en')}</Table.Cell>
        </Table.Row>
      </Table.Footer>
    </Table.Root>
  );
}
