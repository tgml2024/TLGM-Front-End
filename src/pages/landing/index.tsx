import dynamic from 'next/dynamic';
import React from 'react';

const DynamicLandingPage = dynamic(
  () => import('@/components/landing/Landing')
);

const Landing: React.FC = () => {
  return <DynamicLandingPage />;
};

export default Landing;
