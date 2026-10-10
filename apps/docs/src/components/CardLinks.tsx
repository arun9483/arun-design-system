import { Card, Grid, Heading, Paragraph } from '@arun-dev/ui';

/** `description` is text; a span in backticks is shown as code, as in the prose around it. */
export type CardLinkItem = { title: string; description: string; href?: string };

function withCode(text: string) {
  return text.split(/`([^`]+)`/).map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part));
}

/**
 * A grid of cards, in the design system's own Card, Grid and type. A card with an `href` is a
 * link and rises under the pointer (`lift`); one without is a still panel of text.
 */
export default function CardLinks({ items }: { items: readonly CardLinkItem[] }) {
  return (
    <Grid minItemSize="16rem" columns={3} gap="sm" className="not-content">
      {items.map(({ title, description, href }) => {
        const content = (
          <>
            <Heading level={2} size="lg">
              {title}
            </Heading>
            <Paragraph size="sm" color="secondary">
              {withCode(description)}
            </Paragraph>
          </>
        );
        return href ? (
          <Card key={title} lift className="ds-card" render={<a href={href}>{content}</a>} />
        ) : (
          <Card key={title} className="ds-card">
            {content}
          </Card>
        );
      })}
    </Grid>
  );
}
