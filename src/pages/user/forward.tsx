import dynamic from 'next/dynamic';
import React from 'react';

import withAuth from '@/utils/withAuth';

const ForwardMessagePage = dynamic(
  () => import('@/components/user/ForwardMessagePage')
);

const ForwardMessage = () => {
  return <ForwardMessagePage />;
};

export default withAuth(ForwardMessage, 'user');
