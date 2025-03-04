import type { GetServerSideProps, NextPage } from 'next';

import Landing from '@/components/landing/Landing';

const HomePage: NextPage = () => {
  return <Landing />;
};

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // Set proper cache headers
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  );

  // Ensure status code is 200
  res.statusCode = 200;

  return {
    props: {
      // your props here
    },
  };
};

export default HomePage;
