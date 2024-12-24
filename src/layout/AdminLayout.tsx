import dynamic from 'next/dynamic';
import React from 'react';

const AdminSidebar = dynamic(
  () => import('../components/sidebar/AdminSidebar'),
  {
    ssr: false,
  }
);

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="">{children}</div>
    </div>
  );
};

export default AdminLayout;
