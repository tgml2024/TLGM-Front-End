import React from 'react';

import withAuth from '@/utils/withAuth';

type DashboardProps = {};

const Dashboard: React.FC<DashboardProps> = () => {
  return <div>Dashboard</div>;
};

export default withAuth(Dashboard, 'admin');
