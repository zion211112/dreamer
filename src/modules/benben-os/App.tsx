import { Switch, Route } from 'wouter';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { Teachers } from './pages/Teachers';
import { Courses } from './pages/Courses';
import { Attendance } from './pages/Attendance';
import { Fees } from './pages/Fees';
import { Library } from './pages/Library';

export type BenbenOSPage = 'dashboard' | 'students' | 'teachers' | 'courses' | 'attendance' | 'fees' | 'library';

export function BenbenOS() {
  return (
    <Layout>
      <Switch>
        <Route path="/benben-os"><Dashboard /></Route>
        <Route path="/benben-os/students"><Students /></Route>
        <Route path="/benben-os/teachers"><Teachers /></Route>
        <Route path="/benben-os/courses"><Courses /></Route>
        <Route path="/benben-os/attendance"><Attendance /></Route>
        <Route path="/benben-os/fees"><Fees /></Route>
        <Route path="/benben-os/library"><Library /></Route>
      </Switch>
    </Layout>
  );
}
