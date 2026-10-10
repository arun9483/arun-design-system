/**
 * The Components sidebar, in groups. Each component page is listed by its file name under one
 * group; the groups keep this order, and the pages inside each are sorted A–Z here, so a new
 * page only needs adding to its group. sidebar-components.unit.spec.ts fails when a page in
 * src/content/docs/components is in no group, or in two.
 */
export const COMPONENT_GROUPS = [
  {
    label: 'Forms',
    pages: [
      'calendar',
      'checkbox',
      'combobox',
      'date-picker',
      'field',
      'input',
      'otp-input',
      'radio-group',
      'range-slider',
      'select',
      'slider',
      'switch',
      'textarea',
    ],
  },
  { label: 'Actions', pages: ['button', 'menu', 'menubar', 'toggle', 'toolbar'] },
  {
    label: 'Navigation',
    pages: ['breadcrumb', 'link', 'pagination', 'stepper', 'tabs', 'tree-view'],
  },
  { label: 'Overlays', pages: ['dialog', 'drawer', 'hover-card', 'popover', 'tooltip'] },
  { label: 'Feedback', pages: ['alert', 'meter', 'progress', 'skeleton', 'spinner', 'toast'] },
  {
    label: 'Data display',
    pages: ['accordion', 'avatar', 'badge', 'card', 'chip', 'kbd', 'table'],
  },
  {
    label: 'Layout and typography',
    pages: ['grid', 'heading', 'paragraph', 'separator', 'stack', 'text'],
  },
];

/** Starlight sidebar items: one group per category, its pages A–Z by file name. */
export function componentSidebar() {
  return COMPONENT_GROUPS.map(({ label, pages }) => ({
    label,
    items: [...pages].sort((a, b) => a.localeCompare(b)).map((page) => `components/${page}`),
  }));
}
