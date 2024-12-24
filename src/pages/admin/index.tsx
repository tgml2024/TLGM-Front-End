import dynamic from 'next/dynamic';
import React from 'react';

const DynamicAdminMainPage = dynamic(
  () => import('@/components/admin/AdminMainPage')
);

const AdminPage = () => {
  return <DynamicAdminMainPage />;
};

export default AdminPage;
