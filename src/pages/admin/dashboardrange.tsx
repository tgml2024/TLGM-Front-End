import dynamic from 'next/dynamic';
import React from 'react';

import withAuth from '@/utils/withAuth';

const DynamicAdminDashboardRange = dynamic(
  () => import('@/components/dashboard/AdminDashboard')
);

type DashboardAdminRangeProps = {};

const DashboardAdminRange: React.FC<DashboardAdminRangeProps> = () => {
  return <DynamicAdminDashboardRange />;
};

export default withAuth(DashboardAdminRange, 'admin');
