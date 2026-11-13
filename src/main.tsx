import { render } from 'preact';
import { App } from './App';
import './styles.css';
import './tailwind.css';
import './styles/workspace-foundation.css';
import './styles/shell.css';
import './styles/page-head.css';
import './styles/people.css';
import './styles/institutions.css';
import './styles/network.css';
import './styles/commons.css';
import './styles/commons-arrival.css';
import './styles/workbench.css';
import './styles/records.css';
import './styles/intelligence.css';
import './styles/coin-lab.css';

render(<App />, document.getElementById('app')!);
