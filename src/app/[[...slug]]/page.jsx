import ClientAppWrapper from './ClientAppWrapper';

export function generateStaticParams() {
  return [
    { slug: [] }, // Root path '/'
    { slug: ['login'] },
    { slug: ['register'] },
    { slug: ['dashboard'] }
  ];
}

export default function Page() {
  return <ClientAppWrapper />;
}
