'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';

export default function Error({ statusCode, hasGetInitialPropsRun }) {
  useEffect(() => {
    document.title = `${statusCode}: Error`;
  }, [statusCode]);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0c10',
      color: '#e8eaf1',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ fontSize: '6rem', fontWeight: 'bold', marginBottom: '1rem', color: '#f26d6d' }}>
          {statusCode}
        </h1>
        <p style={{ fontSize: '1.5rem', color: '#8b91a3', marginBottom: '2rem' }}>
          {statusCode === 404 ? 'Page not found' : 'Internal server error'}
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: '#7c6cff',
            color: 'white',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: '500'
          }}
        >
          Return to workspace
        </a>
      </div>
    </div>
  );
}

Error.getInitialProps = async ({ req, res, err }) => {
  const statusCode = res ? res.statusCode : (err ? err.statusCode : 404);
  return { statusCode };
};