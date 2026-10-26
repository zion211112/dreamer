export function renderErrorPage(): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Error — APT-LABS Kemet OS</title>
      <style>
        body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif;
               background: #0f0f11; color: #e5e5e5; display: flex;
               align-items: center; justify-content: center; min-height: 100vh; }
        .container { text-align: center; padding: 2rem; }
        h1 { font-size: 2rem; margin-bottom: 0.5rem; }
        p { color: #94a3b8; margin-bottom: 1.5rem; }
        button { padding: 0.5rem 1rem; background: #3b82f6; color: white;
                 border: none; border-radius: 0.5rem; cursor: pointer; }
        button:hover { background: #2563eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Something went wrong</h1>
        <p>The page failed to load. Please try refreshing.</p>
        <button onclick="window.location.reload()">Refresh</button>
      </div>
    </body>
    </html>
  `;
}