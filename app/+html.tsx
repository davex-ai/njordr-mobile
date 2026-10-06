import { ScrollViewStyleReset } from 'expo-router/html';

// Web-only root HTML (static rendering).
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const css = `
body { background-color: #f7f6f2; }
@media (prefers-color-scheme: dark) { body { background-color: #0a0d11; } }`;
