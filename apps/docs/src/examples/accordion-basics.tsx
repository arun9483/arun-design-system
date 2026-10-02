import { Accordion } from '@arun-dev/ui';

const faq = [
  { q: 'How long does shipping take?', a: 'Two to five working days, tracked.' },
  { q: 'Can I return an order?', a: 'Within thirty days, unused, with the receipt.' },
  { q: 'Do you ship abroad?', a: 'To most of Europe and North America.' },
];

// exclusive: opening one closes the others — the browser does it, through <details name>.
export default function AccordionBasics() {
  return (
    <Accordion.Root exclusive style={{ inlineSize: '28rem', maxInlineSize: '100%' }}>
      {faq.map(({ q, a }, index) => (
        <Accordion.Item key={q} defaultOpen={index === 0}>
          <Accordion.Trigger>{q}</Accordion.Trigger>
          <Accordion.Panel>{a}</Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
