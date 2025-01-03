import dynamic from 'next/dynamic';
import React from 'react';

import withAuth from '@/utils/withAuth';

const AddUserDynamic = dynamic(
  () => import('@/components/admin//AdminAdduser'),
  {
    ssr: false,
  }
);

const AddUserPage: React.FC = () => {
  return <AddUserDynamic />;
};

export default withAuth(AddUserPage, 'admin');
