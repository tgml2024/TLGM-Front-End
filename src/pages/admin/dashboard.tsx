import dynamic from 'next/dynamic';
import React from 'react';

const DynamicAdminDashboard = dynamic(
  () => import('@/components/dashboard/AdminDashboard')
);

type DashboardAdminProps = {};

const DashboardAdmin: React.FC<DashboardAdminProps> = () => {
  return <DynamicAdminDashboard />;
};

export default DashboardAdmin;
