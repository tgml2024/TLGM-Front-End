import dynamic from 'next/dynamic';
import React from 'react';

import withAuth from '@/utils/withAuth';

const ConfirmTelegramDynamic = dynamic(
  () => import('@/components/admin/AdminTelegramSettings'),
  {
    ssr: false,
  }
);

const ConfirmTelegramPage: React.FC = () => {
  return <ConfirmTelegramDynamic />;
};

export default withAuth(ConfirmTelegramPage, 'admin');
