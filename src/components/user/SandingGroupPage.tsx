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
    <div className="bg-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-5xl font-bold text-center mb-6 sm:mb-12 flex items-center justify-center gap-3 animate__animated animate__fadeIn">
          <MdOutlineForwardToInbox
            className="text-[#FFD700] text-3xl sm:text-5xl animate-pulse 
            drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
          />
          <span
            className="bg-gradient-to-r from-[#FFD700] via-[#D4AF37] to-[#B8860B] text-transparent bg-clip-text 
            drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]
            hover:drop-shadow-[0_0_15px_rgba(212,175,55,0.6)]
            transition-all duration-300
            tracking-wider
            font-extrabold
            transform hover:scale-105
            border-b-4 border-[#D4AF37]/20
            pb-2"
          >
            Manage Sending Groups
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Channels Section */}
          <div className="bg-[#0A0A0A] shadow-lg rounded-lg p-4 sm:p-6 border border-[#FFD700]/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-[#FFD700] via-[#D4AF37] to-[#B8860B] text-transparent bg-clip-text">
                Scan Channel
              </h2>
              <button
                onClick={() => fetchChannels()}
                disabled={isFetchingChannels}
                className={`py-2 px-4 text-sm rounded-lg text-white font-medium transition-all duration-300 
                  ${
                    isFetchingChannels
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#FFD700] to-[#D4AF37] hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] transform hover:scale-105'
                  }`}
              >
                {isFetchingChannels
                  ? 'Loading...'
                  : channels.length > 0
                  ? 'Scan Again'
                  : 'Scan'}
              </button>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by group ID or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#1A1A1A] border-2 border-[#FFD700]/30
                  text-[#FFD700] text-lg font-medium
                  focus:ring-2 focus:ring-[#FFD700] focus:border-transparent 
                  placeholder-[#8B6B43]
                  transition-all duration-300
                  hover:border-[#FFD700]/50
                  focus:shadow-[0_0_10px_rgba(212,175,55,0.2)]"
              />
            </div>

            <div className="border border-[#FFD700]/30 rounded-lg overflow-hidden">
              <div className="max-h-[400px] sm:max-h-[500px] overflow-auto scrollbar-thin scrollbar-thumb-[#FFD700] scrollbar-track-[#1A1A1A]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#1A1A1A]">
                      <th className="px-4 py-3 text-xs font-semibold text-[#FFD700] uppercase tracking-wider">
                        Group ID
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-[#FFD700] uppercase tracking-wider">
                        Group Name
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-[#FFD700] uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FFD700]/20">
                    {channels.length > 0 ? (
                      filteredChannels.map((channel: Channel) => (
                        <tr
                          key={channel.id}
                          className="hover:bg-[#1A1A1A] transition-colors duration-200"
                        >
                          <td className="px-4 py-3 text-sm text-[#FFD700]">
                            {channel.id}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#FFD700]">
                            {channel.title}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => handleAddGroup(channel)}
                              className="p-2 bg-green-500 hover:bg-green-600 rounded-md text-white transition-all duration-300 transform hover:scale-110"
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
                          className="px-4 py-8 text-center text-[#FFD700]"
                        >
                          {channels.length > 0
                            ? 'No matching channels found'
                            : 'No channel found'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sending Groups Section */}
          <div className="bg-[#0A0A0A] shadow-lg rounded-lg p-4 sm:p-6 border border-[#FFD700]/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-[#FFD700] via-[#D4AF37] to-[#B8860B] text-transparent bg-clip-text">
                Sending Groups
              </h2>
            </div>

            <div className="border border-[#FFD700]/30 rounded-lg overflow-hidden">
              <div className="max-h-[400px] sm:max-h-[500px] overflow-auto scrollbar-thin scrollbar-thumb-[#FFD700] scrollbar-track-[#1A1A1A]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#1A1A1A]">
                      <th className="px-4 py-3 text-xs font-semibold text-[#FFD700] uppercase tracking-wider">
                        Group ID
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-[#FFD700] uppercase tracking-wider">
                        Group Name
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-[#FFD700] uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-4 py-3 text-xs font-semibold text-[#FFD700] uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FFD700]/20">
                    {groups.length > 0 ? (
                      groups.map((group) => (
                        <tr
                          key={group.sg_id}
                          className="hover:bg-[#1A1A1A] transition-colors duration-200"
                        >
                          <td className="px-4 py-3 text-sm text-[#FFD700]">
                            {group.sg_tid}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#FFD700]">
                            {group.sg_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#FFD700]">
                            {group.message}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => openDeleteModal(group)}
                              className="p-2 bg-red-600 hover:bg-red-700 rounded-md text-white transition-all duration-300 transform hover:scale-110"
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
                          className="px-4 py-8 text-center text-[#FFD700]"
                        >
                          No groups available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={closeDeleteModal}
            />
            <div className="relative bg-[#0A0A0A] w-full max-w-[90%] sm:max-w-md rounded-3xl shadow-2xl animate__animated animate__zoomIn">
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
                  <h3 className="text-2xl font-bold text-[#FFD700] mt-6 mb-2">
                    Confirm Delete
                  </h3>
                  <p className="text-[#FFD700]/80">
                    Are you sure you want to delete group{' '}
                    <span className="font-semibold text-[#FFD700]">
                      {selectedGroup?.sg_name}
                    </span>
                    ?<br />
                    This action cannot be undone
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button
                    className="w-full px-4 py-2.5 text-sm text-[#FFD700] bg-[#1A1A1A] 
                    rounded-2xl hover:bg-[#2A2A2A] transition-all duration-200 font-medium"
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
