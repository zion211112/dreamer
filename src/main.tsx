import { render } from 'preact';
import { App } from './App';
import './tailwind.css';
// Load the synthetic demo seed side effect: makes window.seedAPTLabsDemo()
// available from the browser console (documented in README/PRODUCT/AGENTS).
import './lib/demo-seed';

render(<App />, document.getElementById('app')!);
