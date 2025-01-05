import dynamic from 'next/dynamic';
import React from 'react';

import withAuth from '@/utils/withAuth';

const SandMessagePageDynamic = dynamic(
  () => import('@/components/user/SandMessage'),
  {
    ssr: false,
  }
);

const SandMessagePage: React.FC = () => {
  return <SandMessagePageDynamic />;
};

export default withAuth(SandMessagePage, 'user');
