import { render } from 'preact';
import { App } from './App';
import './styles.css';
import './styles/workspace-foundation.css';

render(<App />, document.getElementById('app')!);
