import { Link } from 'wouter';
import { Card, CardHead, CardBody } from '@/components/Card';
import { Button } from '@/components/Button';
import { GRADE_SUMMARIES, CBC_DEMO_SCHOOL } from '../lib/cbc-seed';
import { LEARNERS, TEACHERS } from '../lib/data';

const TOTAL_LEARNERS = LEARNERS.length;
const TOTAL_TEACHERS = TEACHERS.filter((t) => t.status === 'active').length;
const TOTAL_PAPERS = GRADE_SUMMARIES.reduce((acc, g) => acc + g.papersMarked, 0);
const AVG = GRADE_SUMMARIES.reduce((acc, g) => acc + g.average, 0) / GRADE_SUMMARIES.length;

type Stat = { label: string; value: string; delta?: string };

const STATS: Stat[] = [
  { label: 'Learners (Gr 4–9)', value: String(TOTAL_LEARNERS), delta: 'CBC active roll' },
  { label: 'Teachers', value: String(TOTAL_TEACHERS), delta: 'Active faculty' },
  { label: 'Papers marked', value: String(TOTAL_PAPERS), delta: 'This term' },
  { label: 'Class average', value: `${Math.round(AVG)}%`, delta: 'All grades' },
];

export function Dashboard() {
  return (
    <div className="benben-page">
      <div className="benben-page-head">
        <div className="benben-page-head-inner">
          <h1 className="benben-page-title">{CBC_DEMO_SCHOOL.name}</h1>
          <p className="benben-page-sub">{CBC_DEMO_SCHOOL.county} · CBC Auto-Marking OS</p>
        </div>
        <div className="benben-page-head-actions">
          <Link href="/benben-os/marking" className="benben-head-btn">
            Mark a paper
          </Link>
        </div>
      </div>

      <section className="benben-stats">
        {STATS.map((s) => (
          <Card key={s.label} className="benben-stat-card">
            <CardHead>
              <span className="benben-stat-label">{s.label}</span>
              {s.delta && <span className="benben-stat-delta">{s.delta}</span>}
            </CardHead>
            <CardBody>
              <span className="benben-stat-value">{s.value}</span>
            </CardBody>
          </Card>
        ))}
      </section>

      <section className="benben-grid">
        <Card className="benben-grade-table">
          <CardHead>
            <h2 className="benben-card-title">Grade coverage — Grades 4 to 9</h2>
          </CardHead>
          <CardBody>
            <table className="benben-table">
              <thead>
                <tr>
                  <th>Grade</th>
                  <th>Learners</th>
                  <th>Papers marked</th>
                  <th>Average</th>
                  <th>EE</th>
                  <th>ME</th>
                  <th>AE</th>
                  <th>BE</th>
                </tr>
              </thead>
              <tbody>
                {GRADE_SUMMARIES.map((g) => (
                  <tr key={g.grade} className="benben-row">
                    <td className="benben-mono">Grade {g.grade}</td>
                    <td className="benben-mono">{g.learners}</td>
                    <td className="benben-mono">{g.papersMarked}</td>
                    <td className="benben-mono">{g.average}%</td>
                    <td className="benben-mono">{g.ee}</td>
                    <td className="benben-mono">{g.me}</td>
                    <td className="benben-mono">{g.ae}</td>
                    <td className="benben-mono">{g.be}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>

        <Card className="benben-quick-actions">
          <CardHead>
            <h2 className="benben-card-title">Quick actions</h2>
          </CardHead>
          <CardBody>
            <div className="benben-action-grid">
              <Button variant="primary" className="benben-action-btn" onClick={() => {}}>
                Mark a paper
              </Button>
              <Button variant="ghost" className="benben-action-btn" onClick={() => {}}>
                View mark schemes
              </Button>
              <Button variant="ghost" className="benben-action-btn" onClick={() => {}}>
                Principal inbox
              </Button>
              <Button variant="ghost" className="benben-action-btn" onClick={() => {}}>
                Add learner
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card className="benben-recent">
          <CardHead>
            <h2 className="benben-card-title">Marked this week</h2>
          </CardHead>
          <CardBody>
            <table className="benben-table">
              <thead>
                <tr>
                  <th>Paper</th>
                  <th>Learner</th>
                  <th>Score</th>
                  <th>Level</th>
                </tr>
              </thead>
              <tbody>
                <tr className="benben-row">
                  <td>Mathematics Gr 5 T1</td>
                  <td>Amani Juma</td>
                  <td className="benben-mono">42/50</td>
                  <td>EE</td>
                </tr>
                <tr className="benben-row">
                  <td>Integrated Science Gr 6 T1</td>
                  <td>Kato Njeri</td>
                  <td className="benben-mono">38/50</td>
                  <td>EE</td>
                </tr>
                <tr className="benben-row">
                  <td>English Gr 9 T1</td>
                  <td>Omar Said</td>
                  <td className="benben-mono">44/50</td>
                  <td>EE</td>
                </tr>
              </tbody>
            </table>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
