import dynamic from 'next/dynamic';
import React from 'react';

import withAuth from '@/utils/withAuth';

const DynamicChangePasswordPage = dynamic(
  () => import('@/components/user/ChangePasswordPage')
);

type ChangePasswordProps = {};

const ChangePassword: React.FC<ChangePasswordProps> = () => {
  return <DynamicChangePasswordPage />;
};

export default withAuth(ChangePassword, 'user');
