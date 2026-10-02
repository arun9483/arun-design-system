import { Breadcrumb } from '@arun-dev/ui';
import { docsUrl } from '@/lib/url';

export default function BreadcrumbBasics() {
  return (
    <Breadcrumb.Root>
      <Breadcrumb.Item>
        <Breadcrumb.Link href={docsUrl('/')}>Home</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Breadcrumb.Link href={docsUrl('/components/button/')}>Components</Breadcrumb.Link>
      </Breadcrumb.Item>
      <Breadcrumb.Item>
        <Breadcrumb.Current>Breadcrumb</Breadcrumb.Current>
      </Breadcrumb.Item>
    </Breadcrumb.Root>
  );
}
