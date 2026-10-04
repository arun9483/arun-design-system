import { Card, Grid } from '@arun-dev/ui';

const plans = ['Free', 'Pro', 'Team', 'Enterprise', 'Education'];

const tile = { padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)' };

export default function GridBasics() {
  return (
    <Grid gap="lg" style={{ inlineSize: '100%' }}>
      {/* Fixed: three equal columns at every width. */}
      <Grid columns={3} gap="2xs">
        {['One', 'Two', 'Three', 'Four', 'Five', 'Six'].map((label) => (
          <Card key={label} style={tile}>
            {label}
          </Card>
        ))}
      </Grid>

      {/* Fitted: as many 6rem columns as there is room for, at most three — four would fit
          here. Narrow the window and they drop to two. */}
      <Grid minItemSize="6rem" columns={3} render={<ul aria-label="Plans" />}>
        {plans.map((plan) => (
          <Card key={plan} render={<li />} style={tile}>
            {plan}
          </Card>
        ))}
      </Grid>
    </Grid>
  );
}
