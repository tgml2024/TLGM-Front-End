import { useQuery } from '@tanstack/react-query';
import React from 'react';

import { getUserProfile } from '@/services/profileService';
import withAuth from '@/utils/withAuth';

const UserMainPage = () => {
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getUserProfile,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="p-8">
      {profileData && (
        <div>
          <h1 className="text-4xl font-bold text-center mb-6">Welcome</h1>
        </div>
      )}
    </div>
  );
};

export default withAuth(UserMainPage, 'user');
