import { Context } from 'hono';
import { renderToString } from 'react-dom/server';

export function renderPage(c: Context, element: JSX.Element) {
  const html = renderToString(element);
  
  return c.html(`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>tsuji1 website</title>
  <meta name="description" content="Welcome to my page!">
  <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
  <div id="root">${html}</div>
  <script type="module" src="/assets/client.js"></script>
</body>
</html>`);
}
