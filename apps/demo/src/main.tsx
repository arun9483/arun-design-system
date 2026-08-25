import { createRoot } from 'react-dom/client';
import { App } from './App';

// Load order mirrors the documented consumer contract:
// primitives + component tokens, then a brand, then component styles.
import '@arun-dev/tokens/base';
import '@arun-dev/tokens/brands/default';
import '@arun-dev/ui/components.css';
import './demo.css';

const container = document.getElementById('root');
if (!container) throw new Error('#root is missing from index.html');

createRoot(container).render(<App />);
