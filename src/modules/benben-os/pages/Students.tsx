import { useMemo, useState } from 'preact/hooks';
import { Card, CardHead, CardBody } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { LEARNERS } from '../lib/data';

export function Students() {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<string | null>(null);

  const list = useMemo(() => LEARNERS.filter((s) =>
    s.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())
    || String(s.grade).toLocaleLowerCase().includes(query.toLocaleLowerCase())
    || s.stream.toLocaleLowerCase().includes(query.toLocaleLowerCase())
  ), [query]);

  return (
    <div className="benben-page">
      <div className="benben-page-head">
        <h1 className="benben-page-title">Learners</h1>
        <p className="benben-page-sub">CBC learner roll — Grades 4 to 9.</p>
      </div>

      <Card className="benben-student-shell">
        <CardHead>
          <div className="benben-toolbar">
            <Input
              placeholder="Search by name, grade, or stream…"
              value={query}
              onChange={(v) => setQuery(v)}
              className="benben-search-input"
            />
            <Button variant="primary" onClick={() => setEditing('new')}>
              Add learner
            </Button>
          </div>
        </CardHead>
        <CardBody>
          <table className="benben-table">
            <thead>
              <tr>
                <th>Adm No.</th>
                <th>Learner</th>
                <th>Grade</th>
                <th>Stream</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id} className="benben-row">
                  <td className="benben-mono">{s.admissionNo}</td>
                  <td>{editing === 'new' ? <LearnerForm onSave={() => setEditing(null)} /> : s.name}</td>
                  <td className="benben-mono">Grade {s.grade}</td>
                  <td className="benben-mono">{s.stream}</td>
                  <td>
                    <span className={`benben-badge benben-badge--${s.status === 'active' ? 'canon' : 'unpaid'}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={5} className="benben-empty">No learners match that search.</td></tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

function LearnerForm({ onSave }: { onSave: () => void }) {
  const [name, setName] = useState('');
  return (
    <tr className="benben-row benben-row--edit">
      <td colSpan={5}>
        <div className="benben-inline-form">
          <Input placeholder="Learner name" value={name} onChange={setName} className="benben-form-input" />
          <Button variant="primary" onClick={onSave} disabled={!name.trim()}>Add</Button>
          <Button variant="ghost" onClick={onSave}>Cancel</Button>
        </div>
      </td>
    </tr>
  );
}
