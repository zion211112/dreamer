import { useMemo, useState } from 'preact/hooks';
import { Card, CardHead, CardBody } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { STUDENTS } from '../lib/data';

export function Students() {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<string | null>(null);

  const list = useMemo(() => STUDENTS.filter(s =>
    s.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())
    || s.grade.toLocaleLowerCase().includes(query.toLocaleLowerCase())
  ), [query]);

  return (
    <div className="benben-page">
      <div className="benben-page-head">
        <h1 className="benben-page-title">Students</h1>
        <p className="benben-page-sub">Current roll and standing for each learner.</p>
      </div>

      <Card className="benben-student-shell">
        <CardHead>
          <div className="benben-toolbar">
            <Input
              placeholder="Search by name or grade…"
              value={query}
              onChange={(v) => setQuery(v)}
              className="benben-search-input"
            />
            <Button variant="primary" onClick={() => setEditing('new')}>
              Add student
            </Button>
          </div>
        </CardHead>
        <CardBody>
          <table className="benben-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Grade</th>
                <th>Stream</th>
                <th>Attendance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id} className="benben-row">
                  <td className="benben-mono">{s.id}</td>
                  <td>{editing === 'new' ? <StudentForm onSave={() => setEditing(null)} /> : s.name}</td>
                  <td className="benben-mono">{s.grade}</td>
                  <td className="benben-mono">{s.stream}</td>
                  <td>
                    <span className={`benben-badge benben-badge--${s.attendance >= 90 ? 'paid' : s.attendance >= 75 ? 'partial' : 'unpaid'}`}>
                      {s.attendance}%
                    </span>
                  </td>
                  <td>
                    <span className={`benben-badge benben-badge--${s.status === 'active' ? 'paid' : 'unpaid'}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={6} className="benben-empty">No students match that search.</td></tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

function StudentForm({ onSave }: { onSave: () => void }) {
  const [name, setName] = useState('');
  return (
    <tr className="benben-row benben-row--edit">
      <td colSpan={6}>
        <div className="benben-inline-form">
          <Input placeholder="Student name" value={name} onChange={setName} className="benben-form-input" />
          <Button variant="primary" onClick={onSave} disabled={!name.trim()}>Add</Button>
          <Button variant="ghost" onClick={onSave}>Cancel</Button>
        </div>
      </td>
    </tr>
  );
}
