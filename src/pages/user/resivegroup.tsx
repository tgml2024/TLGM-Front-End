import dynamic from 'next/dynamic';
import React from 'react';

import withAuth from '@/utils/withAuth';

const ResiveGroupPageDynamic = dynamic(
  () => import('@/components/user/ResiveGroupPage'),
  {
    ssr: false,
  }
);

const ResiveGroupPage: React.FC = () => {
  return <ResiveGroupPageDynamic />;
};

export default withAuth(ResiveGroupPage, 'user');
