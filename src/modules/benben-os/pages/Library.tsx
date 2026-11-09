import { Card, CardHead, CardBody } from '@/components/Card';
import { Button } from '@/components/Button';

const BOOKS = [
  { id: 'B1', title: 'Things Fall Apart', author: 'Chinua Achebe', isbn: '978-0385474542', status: 'available' },
  { id: 'B2', title: 'Petals of Blood', author: 'Ngũgĩ wa Thiong’o', isbn: '978-0143036230', status: 'issued' },
  { id: 'B3', title: 'The River Between', author: 'Ngũgĩ wa Thiong’o', isbn: '978-0143036223', status: 'available' },
  { id: 'B4', title: 'So Long a Letter', author: 'Mariama Bâ', isbn: '978-0435913447', status: 'available' },
  { id: 'B5', title: 'Half of a Yellow Sun', author: 'Chimamanda Ngozi Adichie', isbn: '978-1400094997', status: 'issued' },
];

export function Library() {
  return (
    <div className="benben-page">
      <div className="benben-page-head">
        <h1 className="benben-page-title">Library</h1>
        <p className="benben-page-sub">Catalogue, circulation, and availability.</p>
      </div>

      <Card className="benben-library-shell">
        <CardHead>
          <span className="benben-toolbar-title">Library catalogue</span>
          <Button variant="primary">Add book</Button>
        </CardHead>
        <CardBody>
          <table className="benben-table">
            <thead>
              <tr>
                <th>ISBN</th>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {BOOKS.map((b) => (
                <tr key={b.id} className="benben-row">
                  <td className="benben-mono">{b.isbn}</td>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td>
                    <span className={`benben-badge benben-badge--${b.status === 'available' ? 'paid' : 'unpaid'}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
