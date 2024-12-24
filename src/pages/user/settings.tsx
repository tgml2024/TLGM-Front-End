import dynamic from 'next/dynamic';
import React from 'react';

import withAuth from '@/utils/withAuth';

const UserSettingsDynamic = dynamic(
  () => import('@/components/user/UserSettings'),
  {
    ssr: false,
  }
);

const SettingsPage: React.FC = () => {
  return <UserSettingsDynamic />;
};

export default withAuth(SettingsPage, 'user');
