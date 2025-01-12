/* eslint-disable no-nested-ternary */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiArchiveBoxArrowDown } from 'react-icons/hi2';

import { getUserProfile } from '@/services/profileService';
import {
  deleteGroupsFromDatabase,
  getChannels,
  getGroupsFromDatabase,
  postGroupToDatabase,
} from '@/services/ResiveGroupService';

interface Channel {
  id: string;
  title: string;
  type: string;
}

interface Group {
  rg_id: number;
  userid: number;
  rg_name: string;
  rg_tid: string;
}

const ResiveGroupPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [channelSearchTerm, setChannelSearchTerm] = useState('');
  const [selectedReceivingGroups, setSelectedReceivingGroups] = useState<
    number[]
  >([]);

  // Query user profile
  const { data: profileData } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
  });

  const userId = profileData?.user.userid.toString();

  // Query receiving groups with better error handling
  const { data: groups = [], refetch: refetchGroups } = useQuery({
    queryKey: ['receivingGroups', userId],
    queryFn: () => getGroupsFromDatabase(userId!),
    enabled: !!userId,
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Query channels
  const {
    data: channelsData,
    refetch: fetchChannels,
    isFetching: isFetchingChannels,
  } = useQuery({
    queryKey: ['channels', userId],
    queryFn: async () => {
      const result = await getChannels(userId!);
      // Store channels in localStorage after successful fetch
      localStorage.setItem(`channels_${userId}`, JSON.stringify(result));
      return result;
    },
    initialData: () => {
      // Try to load initial data from localStorage
      const stored = localStorage.getItem(`channels_${userId}`);
      return stored ? JSON.parse(stored) : undefined;
    },
    enabled: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const channels = channelsData?.channels || [];

  // Add group mutation
  const addGroupMutation = useMutation({
    mutationFn: (channel: Channel) =>
      postGroupToDatabase(userId!, channel.title, channel.id),
  });

  // Delete single group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: () => {
      if (!selectedGroup || !userId) throw new Error('Missing data');
      return deleteGroupsFromDatabase([selectedGroup.rg_id], userId);
    },
    onSuccess: () => {
      toast.success('Delete group success');
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['receivingGroups', userId] });
      // Reset UI state
      setIsModalOpen(false);
      setSelectedGroup(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Cannot delete group');
    },
  });

  // Delete multiple groups mutation
  const deleteGroupsMutation = useMutation({
    mutationFn: (groupIds: number[]) => {
      if (!userId) throw new Error('Missing userId');
      return deleteGroupsFromDatabase(groupIds, userId);
    },
    onSuccess: () => {
      toast.success('Delete groups success');
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['receivingGroups', userId] });
      // Reset UI state
      setIsModalOpen(false);
      setSelectedReceivingGroups([]);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Cannot delete groups');
    },
  });

  // Handle mutations effects
  useEffect(() => {
    if (addGroupMutation.isSuccess) {
      toast.success('Add group success');
      queryClient.invalidateQueries({ queryKey: ['receivingGroups', userId] });
    }
    if (addGroupMutation.isError) {
      const error = addGroupMutation.error as any;
      if (error.response?.data?.errorCode) {
        switch (error.response.data.errorCode) {
          case 'DUPLICATE_RG_TID':
            toast.error('Group already exists');
            break;
          case 'CONFLICT_WITH_SENDINGGROUP':
            toast.error('Group conflict with sendinggroup');
            break;
          case 'MISSING_FIELDS':
            toast.error('Please fill in all fields');
            break;
          default:
            toast.error(error.response.data.message || 'Error');
        }
      } else {
        toast.error('Error connecting to server');
      }
    }
  }, [addGroupMutation.isSuccess, addGroupMutation.isError]);

  useEffect(() => {
    if (deleteGroupMutation.isSuccess) {
      toast.success('Delete group success');
      queryClient.invalidateQueries({ queryKey: ['receivingGroups', userId] });
      setIsModalOpen(false);
      setSelectedGroup(null);
    }
    if (deleteGroupMutation.isError) {
      toast.error('Cannot delete group');
    }
  }, [deleteGroupMutation.isSuccess, deleteGroupMutation.isError]);

  // Update delete effect
  useEffect(() => {
    if (deleteGroupsMutation.isSuccess) {
      toast.success('Delete groups success');
      queryClient.invalidateQueries({ queryKey: ['receivingGroups', userId] });
      setIsModalOpen(false);
      setSelectedReceivingGroups([]);
    }
    if (deleteGroupsMutation.isError) {
      toast.error('Cannot delete groups');
    }
  }, [deleteGroupsMutation.isSuccess, deleteGroupsMutation.isError]);

  // Update handlers to use mutations
  const handleAddGroup = (channel: Channel) => {
    if (!userId) {
      toast.error('User not found');
      return;
    }
    addGroupMutation.mutate(channel);
  };

  const handleDeleteGroup = () => {
    if (!selectedGroup || !userId) return;
    deleteGroupMutation.mutate();
  };

  // Add delete selected groups handler
  const handleDeleteSelectedGroups = () => {
    if (selectedReceivingGroups.length === 0 || !userId) return;
    deleteGroupsMutation.mutate(selectedReceivingGroups);
  };

  // เปิด Modal ยืนยันการลบ
  const openDeleteModal = (group: Group) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedChannels(channels.map((channel: Channel) => channel.id));
    } else {
      setSelectedChannels([]);
    }
  };

  const handleSelectChannel = (channelId: string, checked: boolean) => {
    if (checked) {
      setSelectedChannels([...selectedChannels, channelId]);
    } else {
      setSelectedChannels(selectedChannels.filter((id) => id !== channelId));
    }
  };

  const handleAddSelected = () => {
    const selectedItems = channels.filter((channel: Channel) =>
      selectedChannels.includes(channel.id)
    );
    selectedItems.forEach((channel: Channel) => {
      handleAddGroup({ ...channel, type: 'group' });
    });
    setSelectedChannels([]); // Clear selection after adding
  };

  // Add this function to filter groups
  const filteredGroups = groups.filter(
    (group) =>
      group.rg_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.rg_tid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add this function to filter channels
  const filteredChannels = channels.filter(
    (channel: Channel) =>
      channel.id.toLowerCase().includes(channelSearchTerm.toLowerCase()) ||
      channel.title.toLowerCase().includes(channelSearchTerm.toLowerCase())
  );

  // Add new handlers for receiving groups selection
  const handleSelectAllReceivingGroups = (checked: boolean) => {
    if (checked) {
      setSelectedReceivingGroups(filteredGroups.map((group) => group.rg_id));
    } else {
      setSelectedReceivingGroups([]);
    }
  };

  const handleSelectReceivingGroup = (groupId: number, checked: boolean) => {
    if (checked) {
      setSelectedReceivingGroups([...selectedReceivingGroups, groupId]);
    } else {
      setSelectedReceivingGroups(
        selectedReceivingGroups.filter((id) => id !== groupId)
      );
    }
  };

  // Call refetch after successful mutations
  useEffect(() => {
    if (deleteGroupMutation.isSuccess || deleteGroupsMutation.isSuccess) {
      refetchGroups();
    }
  }, [deleteGroupMutation.isSuccess, deleteGroupsMutation.isSuccess]);

  return (
    <div className="bg-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-5xl font-bold text-center mb-6 sm:mb-12 flex items-center justify-center gap-3 animate__animated animate__fadeIn">
          <HiArchiveBoxArrowDown
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
            Manage Receiving Groups
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
                value={channelSearchTerm}
                onChange={(e) => setChannelSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-[#1A1A1A] border-2 border-[#FFD700]/30
                  text-[#FFD700] text-lg font-medium
                  focus:ring-2 focus:ring-[#FFD700] focus:border-transparent 
                  placeholder-[#8B6B43]
                  transition-all duration-300
                  hover:border-[#FFD700]/50
                  focus:shadow-[0_0_10px_rgba(212,175,55,0.2)]"
              />
            </div>

            {selectedChannels.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={handleAddSelected}
                  className="py-2 px-4 text-sm rounded-lg text-white font-medium
                    bg-gradient-to-r from-green-500 to-green-600
                    hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]
                    transform hover:scale-105
                    transition-all duration-300"
                >
                  Add Selected ({selectedChannels.length})
                </button>
              </div>
            )}

            <div className="border border-[#FFD700]/30 rounded-lg overflow-hidden">
              <div className="max-h-[400px] sm:max-h-[500px] overflow-auto scrollbar-thin scrollbar-thumb-[#FFD700] scrollbar-track-[#1A1A1A]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#1A1A1A]">
                      <th className="px-4 py-3 text-xs font-semibold text-[#FFD700] uppercase tracking-wider">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-[#FFD700] text-[#FFD700] focus:ring-[#FFD700]
                              transition-all duration-200 cursor-pointer"
                            checked={
                              channels.length > 0 &&
                              selectedChannels.length === channels.length
                            }
                            onChange={(e) => handleSelectAll(e.target.checked)}
                          />
                          <span className="ml-2">Select all</span>
                        </div>
                      </th>
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
                    {filteredChannels.length > 0 ? (
                      filteredChannels.map((channel: Channel) => (
                        <tr
                          key={channel.id}
                          className="hover:bg-[#1A1A1A] transition-colors duration-200"
                        >
                          <td className="px-4 py-3 text-sm">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-[#FFD700] text-[#FFD700] focus:ring-[#FFD700]
                                transition-all duration-200 cursor-pointer"
                              checked={selectedChannels.includes(channel.id)}
                              onChange={(e) =>
                                handleSelectChannel(
                                  channel.id,
                                  e.target.checked
                                )
                              }
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-[#FFD700]">
                            {channel.id}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#FFD700]">
                            {channel.title}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() =>
                                handleAddGroup({ ...channel, type: 'group' })
                              }
                              className="p-2 rounded-md text-white
                                bg-gradient-to-r from-[#FFD700] to-[#D4AF37]
                                hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]
                                transform hover:scale-110
                                transition-all duration-300"
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
                          colSpan={4}
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

          {/* Groups Section */}
          <div className="bg-[#0A0A0A] shadow-lg rounded-lg p-4 sm:p-6 border border-[#FFD700]/20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-[#FFD700] via-[#D4AF37] to-[#B8860B] text-transparent bg-clip-text">
                Receiving Groups
              </h2>
            </div>

            <div className="mb-4">
              <input
                type="text"
                placeholder="Search groups..."
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
            {selectedReceivingGroups.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => {
                    setIsModalOpen(true);
                    setSelectedGroup(null);
                  }}
                  className="py-2 px-4 text-sm rounded-lg text-white font-medium
                    bg-gradient-to-r from-red-600 to-red-700
                    hover:shadow-[0_0_15px_rgba(220,38,38,0.3)]
                    transform hover:scale-105
                    transition-all duration-300"
                >
                  Delete Selected ({selectedReceivingGroups.length})
                </button>
              </div>
            )}

            <div className="border border-[#FFD700]/30 rounded-lg overflow-hidden">
              <div className="max-h-[400px] sm:max-h-[500px] overflow-auto scrollbar-thin scrollbar-thumb-[#FFD700] scrollbar-track-[#1A1A1A]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#1A1A1A]">
                      <th className="px-4 py-3 text-xs font-semibold text-[#FFD700] uppercase tracking-wider">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-[#FFD700] text-[#FFD700] focus:ring-[#FFD700]
                              transition-all duration-200 cursor-pointer"
                            checked={
                              filteredGroups.length > 0 &&
                              selectedReceivingGroups.length ===
                                filteredGroups.length
                            }
                            onChange={(e) =>
                              handleSelectAllReceivingGroups(e.target.checked)
                            }
                          />
                          <span className="ml-2">Select all</span>
                        </div>
                      </th>
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
                    {filteredGroups.length > 0 ? (
                      filteredGroups.map((group) => (
                        <tr
                          key={group.rg_id}
                          className="hover:bg-[#1A1A1A] transition-colors duration-200"
                        >
                          <td className="px-4 py-3 text-sm">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-[#FFD700] text-[#FFD700] focus:ring-[#FFD700]
                                transition-all duration-200 cursor-pointer"
                              checked={selectedReceivingGroups.includes(
                                group.rg_id
                              )}
                              onChange={(e) =>
                                handleSelectReceivingGroup(
                                  group.rg_id,
                                  e.target.checked
                                )
                              }
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-[#FFD700]">
                            {group.rg_tid}
                          </td>
                          <td className="px-4 py-3 text-sm text-[#FFD700]">
                            {group.rg_name}
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
                          {searchTerm
                            ? 'No matching groups found'
                            : 'No groups available'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal with Animation */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative bg-white dark:bg-gray-800 w-full max-w-[90%] sm:max-w-md rounded-3xl shadow-2xl animate__animated animate__zoomIn">
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
                    {selectedGroup
                      ? `Are you sure you want to delete group ${selectedGroup.rg_name}?`
                      : `Are you sure you want to delete ${selectedReceivingGroups.length} selected groups?`}
                    <br />
                    This action cannot be undone
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button
                    className="w-full px-4 py-2.5 text-sm text-gray-700 bg-gray-100 
                    rounded-2xl hover:bg-gray-200 transition-all duration-200 font-medium"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="w-full px-4 py-2.5 text-sm text-white bg-red-500 hover:bg-red-600
                    rounded-2xl transition-all duration-200 font-medium"
                    onClick={
                      selectedGroup
                        ? handleDeleteGroup
                        : handleDeleteSelectedGroups
                    }
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

export default ResiveGroupPage;
