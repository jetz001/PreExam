import ClientAppWrapper from './ClientAppWrapper';

// Required for 'output: export' with dynamic routes
export function generateStaticParams() {
  return [
    { slug: [] },
    { slug: ['login'] },
    { slug: ['register'] },
    { slug: ['dashboard'] },
    { slug: ['profile'] },
    { slug: ['settings'] },
    { slug: ['community'] },
    { slug: ['news'] },
    { slug: ['admin'] },
    { slug: ['exam'] }
  ];
}

export default function Page() {
  return <ClientAppWrapper />;
}
