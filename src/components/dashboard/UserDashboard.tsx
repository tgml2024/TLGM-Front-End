import React from 'react';

import withAuth from '@/utils/withAuth';

const UserDashboard = () => {
  return <div>UserDashboard</div>;
};

export default withAuth(UserDashboard, 'user');
