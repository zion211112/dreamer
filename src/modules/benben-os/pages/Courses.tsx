import { Card, CardHead, CardBody } from '@/components/Card';
import { Button } from '@/components/Button';
import { CBC_SUBJECTS } from '../lib/cbc';

export function Courses() {
  return (
    <div className="benben-page">
      <div className="benben-page-head">
        <h1 className="benben-page-title">Courses</h1>
        <p className="benben-page-sub">CBC subjects offered by grade, with strands.</p>
      </div>

      <Card className="benben-course-shell">
        <CardHead>
          <span className="benben-toolbar-title">CBC course catalogue</span>
          <Button variant="primary">Add course</Button>
        </CardHead>
        <CardBody>
          <table className="benben-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Subject</th>
                <th>Grades</th>
                <th>Strands</th>
              </tr>
            </thead>
            <tbody>
              {CBC_SUBJECTS.map((c) => (
                <tr key={c.code} className="benben-row">
                  <td className="benben-mono">{c.code}</td>
                  <td>{c.name}</td>
                  <td className="benben-mono">{c.grades.join(', ')}</td>
                  <td>{c.strands.map((s) => s.name).join(' · ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
