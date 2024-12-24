import React from 'react';

import withAuth from '@/utils/withAuth';

type AdminSettingsProps = {};

const AdminSettings: React.FC<AdminSettingsProps> = () => {
  return <div>AdminSettings</div>;
};

export default withAuth(AdminSettings, 'admin');
