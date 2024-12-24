import dynamic from 'next/dynamic';
import React from 'react';

import withAuth from '@/utils/withAuth';

const SandingGroupPageDynamic = dynamic(
  () => import('@/components/user/SandingGroupPage'),
  {
    ssr: false,
  }
);

const SandingGroupPage: React.FC = () => {
  return <SandingGroupPageDynamic />;
};

export default withAuth(SandingGroupPage, 'user');
