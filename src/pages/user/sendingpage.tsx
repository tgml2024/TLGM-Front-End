import dynamic from 'next/dynamic';
import React from 'react';

import withAuth from '@/utils/withAuth';

const SandMessagePageDynamic = dynamic(
  () => import('@/components/user/SendingPage'),
  {
    ssr: false,
  }
);

const SendingPage: React.FC = () => {
  return <SandMessagePageDynamic />;
};

export default withAuth(SendingPage, 'user');
