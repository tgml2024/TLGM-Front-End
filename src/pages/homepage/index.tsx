import dynamic from 'next/dynamic';
import React from 'react';

const Homepage = dynamic(() => import('@/components/home/home'));

const HomePage = () => {
  return <Homepage />;
};

export default HomePage;
