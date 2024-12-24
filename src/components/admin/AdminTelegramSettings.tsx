import React from 'react';

import withAuth from '@/utils/withAuth';

type AdminTelegramSettingsProps = {};

const AdminTelegramSettings: React.FC<AdminTelegramSettingsProps> = () => {
  return <div>AdminTelegramSettings</div>;
};

export default withAuth(AdminTelegramSettings, 'admin');
