import { render } from 'preact';
import { App } from './App';
import './styles.css';
import './tailwind.css';
import './styles/workspace-foundation.css';
import './styles/shell.css';
import './styles/people.css';
import './styles/institutions.css';
import './styles/network.css';
import './styles/commons.css';
import './styles/workbench.css';
import './styles/records.css';

render(<App />, document.getElementById('app')!);
