/* eslint-disable no-nested-ternary */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { HiArchiveBoxArrowDown } from 'react-icons/hi2';

import { getUserProfile } from '@/services/profileService';
import {
  deleteGroupFromDatabase,
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
  rgId: number;
  userId: number;
  rgName: string;
  rgTid: string;
}

const ResiveGroupPage = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  // Query user profile
  const { data: profileData } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getUserProfile,
  });

  const userId = profileData?.user.userid.toString();

  // Query receiving groups
  const { data: groups = [] } = useQuery({
    queryKey: ['receivingGroups', userId],
    queryFn: () => getGroupsFromDatabase(userId!),
    enabled: !!userId,
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

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: () =>
      deleteGroupFromDatabase(selectedGroup!.rgId.toString(), userId!),
  });

  // Handle mutations effects
  useEffect(() => {
    if (addGroupMutation.isSuccess) {
      toast.success('Add group success');
      queryClient.setQueryData(
        ['receivingGroups', userId],
        (oldData: Group[] = []) => [
          ...oldData,
          {
            rgId: addGroupMutation.data.groupId,
            userId: parseInt(userId!, 10),
            rgName: addGroupMutation.variables?.title,
            rgTid: addGroupMutation.variables?.id,
          },
        ]
      );
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
      queryClient.setQueryData(
        ['receivingGroups', userId],
        (oldData: Group[] = []) =>
          oldData.filter((group) => group.rgId !== selectedGroup?.rgId)
      );
      setIsModalOpen(false);
      setSelectedGroup(null);
    }
    if (deleteGroupMutation.isError) {
      toast.error('Cannot delete group');
    }
  }, [deleteGroupMutation.isSuccess, deleteGroupMutation.isError]);

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

  // เปิด Modal ยืนยันการลบ
  const openDeleteModal = (group: Group) => {
    setSelectedGroup(group);
    setIsModalOpen(true);
  };

  // ปิด Modal ยืนยันการลบ
  const closeDeleteModal = () => {
    setIsModalOpen(false);
    setSelectedGroup(null);
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

  // Add new state for selected receiving groups
  const [selectedReceivingGroups, setSelectedReceivingGroups] = useState<
    number[]
  >([]);

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

  return (
    <div className=" bg-gray-50 p-2 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl sm:text-3xl font-bold text-center text-gray-800 mb-4 sm:mb-8 flex items-center justify-center gap-2">
          <HiArchiveBoxArrowDown className="text-2xl sm:text-4xl text-blue-600" />
          Manage receiving groups
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-7">
          {/* ส่วนของช่อง */}
          <div className="bg-white shadow-lg rounded-lg p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-700">
                Scan
              </h2>
              <div className="flex gap-2 w-full sm:w-auto">
                {selectedChannels.length > 0 && (
                  <button
                    onClick={handleAddSelected}
                    className="w-full sm:w-auto py-1.5 sm:py-2 px-4 sm:px-6 text-sm sm:text-base rounded-lg text-white font-medium bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    Add ({selectedChannels.length})
                  </button>
                )}
                <button
                  onClick={() => fetchChannels()}
                  disabled={isFetchingChannels}
                  className={`w-full sm:w-auto py-1.5 sm:py-2 px-4 sm:px-6 text-sm sm:text-base rounded-lg text-white font-medium transition-colors ${
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
            </div>

            <div className="border border-gray-200 rounded-lg">
              <div className="max-h-[400px] sm:max-h-[500px] overflow-auto">
                <div className="overflow-x-auto -mx-3 sm:mx-0">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              checked={
                                channels.length > 0 &&
                                selectedChannels.length === channels.length
                              }
                              onChange={(e) =>
                                handleSelectAll(e.target.checked)
                              }
                            />
                            <span className="ml-2">Select all</span>
                          </div>
                        </th>
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
                        channels.map(
                          (channel: { id: string; title: string }) => (
                            <tr key={channel.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={selectedChannels.includes(
                                    channel.id
                                  )}
                                  onChange={(e) =>
                                    handleSelectChannel(
                                      channel.id,
                                      e.target.checked
                                    )
                                  }
                                />
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {channel.id}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {channel.title}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <button
                                  onClick={() =>
                                    handleAddGroup({
                                      ...channel,
                                      type: 'group',
                                    })
                                  }
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
                          )
                        )
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
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
          </div>

          {/* ส่วนของกลุ่ม */}
          <div className="bg-white shadow-lg rounded-lg p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-gray-700">
                Receiving groups
              </h2>
              <div className="w-full sm:w-64 relative">
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2"
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
              <div className="max-h-[400px] sm:max-h-[500px] overflow-auto">
                <div className="overflow-x-auto -mx-3 sm:mx-0">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                      {filteredGroups.length > 0 ? (
                        filteredGroups.map((group) => (
                          <tr key={group.rg_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {group.rg_tid}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {group.rg_name}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <button
                                onClick={() =>
                                  openDeleteModal({
                                    rgId: group.rg_id,
                                    userId: group.userid,
                                    rgName: group.rg_name,
                                    rgTid: group.rg_tid,
                                  })
                                }
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
                            colSpan={3}
                            className="px-4 py-8 text-center text-gray-500"
                          >
                            {groups.length > 0
                              ? 'No matching groups found'
                              : 'No group found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal ยืนยันการลบ */}
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
                      {selectedGroup?.rgName}
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

export default ResiveGroupPage;
