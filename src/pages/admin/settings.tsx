import dynamic from 'next/dynamic';
import React from 'react';

import withAuth from '@/utils/withAuth';

const AdminSettingsDynamic = dynamic(
  () => import('@/components/admin/AdminSettings'),
  {
    ssr: false,
  }
);

const SettingsPage: React.FC = () => {
  return <AdminSettingsDynamic />;
};

export default withAuth(SettingsPage, 'admin');
