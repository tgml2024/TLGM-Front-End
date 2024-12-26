import React, { useEffect, useState } from 'react';

import { getActiveForwarders } from '@/services/forwardService';
import withAuth from '@/utils/withAuth';

type DashboardProps = {};

const Dashboard: React.FC<DashboardProps> = () => {
  const [activeForwarders, setActiveForwarders] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchActiveForwarders = async () => {
      try {
        const response = await getActiveForwarders();
        setActiveForwarders(response.activeForwarders);
      } catch (err) {
        setError('Failed to fetch active forwarders');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveForwarders();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchActiveForwarders, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Admin Dashboard
      </h1>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Active Forwarders
          </h2>
          <div className="flex items-center justify-center">
            <div className="text-5xl font-bold text-blue-600">
              {activeForwarders}
            </div>
          </div>
          <p className="text-gray-600 mt-4 text-center">
            Current active forwarding users
          </p>
        </div>
      </div>
    </div>
  );
};

export default withAuth(Dashboard, 'admin');
