import dynamic from 'next/dynamic';
import React from 'react';

import withAuth from '@/utils/withAuth';

const AddUserDynamic = dynamic(
  () => import('@/components/admin//ManageUsers'),
  {
    ssr: false,
  }
);

const ManageUserPage: React.FC = () => {
  return <AddUserDynamic />;
};

export default withAuth(ManageUserPage, 'admin');
