/* eslint-disable no-nested-ternary */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MdOutlineForwardToInbox } from 'react-icons/md';

import { getUserProfile } from '@/services/profileService';
import { getChannels } from '@/services/ResiveGroupService';
import {
  deleteSandingGroupFromDatabase,
  getSandingGroupsFromDatabase,
  postSandingGroupToDatabase,
} from '@/services/SandingGroupService';

interface Channel {
  id: string;
  title: string;
  type: string;
}

interface SendingGroup {
  sg_id: number;
  userid: number;
  sg_name: string;
  message: string;
  sg_tid?: string;
}

const SandingGroupPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SendingGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Query user profile
  const { data: profileData } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
  });

  const userId = profileData?.user.userid.toString();

  // Query sending groups
  const { data: groups = [] } = useQuery({
    queryKey: ['sendingGroups', userId],
    queryFn: () => getSandingGroupsFromDatabase(userId!),
    enabled: !!userId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Query channels with localStorage caching
  const {
    data: channelsData,
    refetch: fetchChannels,
    isFetching: isFetchingChannels,
  } = useQuery({
    queryKey: ['channels', userId],
    queryFn: async () => {
      const response = await getChannels(userId!);
      // Store channels in localStorage after successful fetch
      localStorage.setItem(`channels-${userId}`, JSON.stringify(response));
      return response;
    },
    initialData: () => {
      // Try to load initial data from localStorage
      const cached = localStorage.getItem(`channels-${userId}`);
      return cached ? JSON.parse(cached) : undefined;
    },
    enabled: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const channels = channelsData?.channels || [];

  // Filter channels based on search term
  const filteredChannels = channels.filter(
    (channel: Channel) =>
      channel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      channel.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add group mutation
  const addGroupMutation = useMutation({
    mutationFn: ({
      title,
      message,
      channelId,
    }: {
      title: string;
      message: string;
      channelId: string;
    }) => postSandingGroupToDatabase(userId!, title, message, channelId),
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: ({ groupId }: { groupId: string }) =>
      deleteSandingGroupFromDatabase(groupId, userId!),
  });

  // Handler functions
  const handleAddGroup = (channel: Channel) => {
    if (!userId) {
      toast.error('User not found');
      return;
    }

    addGroupMutation.mutate({
      title: channel.title,
      message: 'Start message',
      channelId: channel.id,
    });
  };

  const handleDeleteGroup = () => {
    if (!selectedGroup || !userId) return;

    deleteGroupMutation.mutate({
      groupId: selectedGroup.sg_id.toString(),
    });
  };

  // Open modal to confirm deletion
  const openDeleteModal = (group: SendingGroup) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  // Close deletion confirmation modal
  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
  };

  useEffect(() => {
    if (addGroupMutation.isSuccess) {
      toast.success('Add group success');
      // อัพเดท cache
      queryClient.setQueryData(
        ['sendingGroups', userId],
        (oldData: SendingGroup[] = []) => [
          ...oldData,
          {
            sg_id: addGroupMutation.data.groupId,
            userid: parseInt(userId!, 10),
            sg_name: addGroupMutation.variables?.title,
            message: addGroupMutation.variables?.message,
            sg_tid: addGroupMutation.variables?.channelId,
          },
        ]
      );
    }
    if (addGroupMutation.isError) {
      toast.error(addGroupMutation.error?.message || 'Cannot add group');
    }
  }, [addGroupMutation.isSuccess, addGroupMutation.isError]);

  useEffect(() => {
    if (deleteGroupMutation.isSuccess) {
      toast.success('Delete group success');
      queryClient.setQueryData(
        ['sendingGroups', userId],
        (oldData: SendingGroup[] = []) =>
          oldData.filter(
            (group) =>
              group.sg_id.toString() !== deleteGroupMutation.variables?.groupId
          )
      );
      closeDeleteModal();
    }
    if (deleteGroupMutation.isError) {
      toast.error(deleteGroupMutation.error?.message || 'Cannot delete group');
    }
  }, [deleteGroupMutation.isSuccess, deleteGroupMutation.isError]);

  return (
    <div className="bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
          <MdOutlineForwardToInbox className="w-8 h-8 text-blue-800" />
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800">
            Manage sending groups
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Scan channel
              </h2>
              <button
                onClick={() => fetchChannels()}
                disabled={isFetchingChannels}
                className={`w-full sm:w-auto py-2 px-6 rounded-lg text-white font-medium transition-colors ${
                  isFetchingChannels
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isFetchingChannels
                  ? 'Loading...'
                  : channels.length > 0
                  ? 'Scan again'
                  : 'Scan'}
              </button>
            </div>

            {/* Add search box */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by group ID or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
                <svg
                  className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg">
              <div className="max-h-[450px] overflow-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Group ID
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Group Name
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {channels.length > 0 ? (
                      filteredChannels.map((channel: Channel) => (
                        <tr key={channel.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {channel.id}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {channel.title}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => handleAddGroup(channel)}
                              className="p-2 bg-green-500 hover:bg-green-600 rounded-md text-white transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 4.5v15m7.5-7.5h-15"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          No channel found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section for Sending Groups */}
          <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Sending groups
            </h2>

            <div className="border border-gray-200 rounded-lg">
              <div className="max-h-[400px] overflow-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Group ID
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Group Name
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {groups.length > 0 ? (
                      groups.map((group) => (
                        <tr key={group.sg_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {group.sg_tid}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {group.sg_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">
                            {group.message}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => openDeleteModal(group)}
                              className="p-2 bg-red-500 hover:bg-red-600 rounded-md text-white transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          No group found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal - Updated for better mobile experience */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={closeDeleteModal}
            />
            <div className="relative bg-white dark:bg-gray-800 w-full max-w-[90%] sm:max-w-md rounded-3xl shadow-2xl">
              <div className="p-4 sm:p-8">
                <div className="text-center mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mx-auto h-16 w-16 text-red-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-2">
                    Confirm Delete
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Are you sure you want to delete group{' '}
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                      {selectedGroup?.sg_name}
                    </span>{' '}
                    ? <br />
                    This action cannot be undone
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button
                    className="w-full px-4 py-2.5 text-sm text-gray-700 bg-gray-100 
                    rounded-2xl hover:bg-gray-200 transition-all duration-200 font-medium"
                    onClick={closeDeleteModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="w-full px-4 py-2.5 text-sm text-white bg-red-500 hover:bg-red-600
                    rounded-2xl transition-all duration-200 font-medium"
                    onClick={handleDeleteGroup}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SandingGroupPage;
