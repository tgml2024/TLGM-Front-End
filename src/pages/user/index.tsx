import dynamic from 'next/dynamic';
import React from 'react';

import withAuth from '@/utils/withAuth';

const DynamicUserMainPage = dynamic(
  () => import('@/components/user/UserMainPage')
);

const UserPage = () => {
  return <DynamicUserMainPage />;
};

export default withAuth(UserPage, 'user');
