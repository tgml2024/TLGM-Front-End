import dynamic from 'next/dynamic';
import React from 'react';

import withAuth from '@/utils/withAuth';

const DynamicUserDashboard = dynamic(
  () => import('@/components/dashboard/UserDashboard')
);

type DashboardUserProps = {};

const DashboardUser: React.FC<DashboardUserProps> = () => {
  return <DynamicUserDashboard />;
};

export default withAuth(DashboardUser, 'user');
