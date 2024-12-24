import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React from 'react';

import { logout } from '@/services/logoutServices';
import { getAdminProfiles } from '@/services/profileService';
import withAuth from '@/utils/withAuth';

const AdminMainPage: React.FC = () => {
  const router = useRouter();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getAdminProfiles,
  });

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">ข้อมูล Admin</h1>
      {profileData && (
        <div className="mb-4">
          <p>Username: {profileData.user.username}</p>
          <p>Name: {profileData.user.name}</p>
          <p>Role: {profileData.user.role}</p>
        </div>
      )}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default withAuth(AdminMainPage, 'admin');
