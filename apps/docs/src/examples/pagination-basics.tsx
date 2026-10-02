import { useState } from 'react';
import { Pagination } from '@arun-dev/ui';

// Buttons, with the page in state. With pages as URLs, pass getHref instead.
export default function PaginationBasics() {
  const [page, setPage] = useState(6);
  return (
    <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
      <Pagination page={page} count={20} onPageChange={setPage} />
      <p style={{ margin: 0 }}>Showing page {page} of 20.</p>
    </div>
  );
}
