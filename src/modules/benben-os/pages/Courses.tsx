import { Card, CardHead, CardBody } from '@/components/Card';
import { Button } from '@/components/Button';
import { COURSES } from '../lib/data';

export function Courses() {
  return (
    <div className="benben-page">
      <div className="benben-page-head">
        <h1 className="benben-page-title">Courses</h1>
        <p className="benben-page-sub">Scheduled courses, assigned teachers, and enrolment.</p>
      </div>

      <Card className="benben-course-shell">
        <CardHead>
          <span className="benben-toolbar-title">Course catalogue</span>
          <Button variant="primary">Add course</Button>
        </CardHead>
        <CardBody>
          <table className="benben-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Course</th>
                <th>Teacher</th>
                <th>Students</th>
              </tr>
            </thead>
            <tbody>
              {COURSES.map((c) => (
                <tr key={c.id} className="benben-row">
                  <td className="benben-mono">{c.code}</td>
                  <td>{c.name}</td>
                  <td>{c.teacher}</td>
                  <td className="benben-mono">{c.students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
