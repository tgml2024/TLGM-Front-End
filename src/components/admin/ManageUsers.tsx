import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import {
  getAdminUsers,
  updateUserStatus,
} from '../../services/manageuserService';
import { Register } from '../../services/registerService';

interface UserFormData {
  username: string;
  password: string;
  name: string;
  status: number;
}

interface User {
  userid: number;
  username: string;
  name: string;
  status: number;
}

const ManageUsers = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    name: '',
    status: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    userId: number | null;
    newStatus: number | null;
    statusText: string;
  }>({
    isOpen: false,
    userId: null,
    newStatus: null,
    statusText: '',
  });
  const [hasFormChanges, setHasFormChanges] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAdminUsers();
        setUsers(response.users);
      } catch (error) {
        toast.error('Error fetching users');
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        return;
      }

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const isFormEmpty =
      formData.username === '' &&
      formData.password === '' &&
      formData.name === '' &&
      formData.status === 0;
    setHasFormChanges(!isFormEmpty);
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.username) {
      newErrors.username = 'Please enter a username';
    } else if (formData.username.length < 4 || formData.username.length > 20) {
      newErrors.username = 'Username must be 4-20 characters long';
    }

    if (!formData.password) {
      newErrors.password = 'Please enter a password';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.name) {
      newErrors.name = 'Please enter a name';
    } else if (formData.name.length < 4 || formData.name.length > 20) {
      newErrors.name = 'Name must be 4-20 characters long';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      await Register(formData);
      // Refresh user list or add new user to the list
      setIsDrawerOpen(false);
      // Reset form
      setFormData({ username: '', password: '', name: '', status: 0 });
      // You might want to show a success message
      toast.success('เพิ่มผู้ใช้สำเร็จ');
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('เกิดข้อผิดพลาดในการเพิ่มผู้ใช้');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return { label: 'Active', color: 'bg-green-100 text-green-800' };
      case 1:
        return { label: 'Deleted', color: 'bg-red-100 text-red-800' };
      case 2:
        return { label: 'Suspended', color: 'bg-yellow-100 text-yellow-800' };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const handleStatusUpdate = async (userid: number, newStatus: number) => {
    const statusTexts = {
      0: 'activate',
      1: 'delete',
      2: 'suspend',
    };

    setConfirmModal({
      isOpen: true,
      userId: userid,
      newStatus,
      statusText: statusTexts[newStatus as keyof typeof statusTexts],
    });
    setActiveDropdown(null);
  };

  const confirmStatusUpdate = async () => {
    if (!confirmModal.userId || confirmModal.newStatus === null) return;

    try {
      await updateUserStatus(confirmModal.userId, confirmModal.newStatus);
      const response = await getAdminUsers();
      setUsers(response.users);
      toast.success('Updated user status successfully');
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setConfirmModal({
        isOpen: false,
        userId: null,
        newStatus: null,
        statusText: '',
      });
    }
  };

  const resetForm = () => {
    setFormData({ username: '', password: '', name: '', status: 0 });
    setErrors({});
  };

  const handleCloseDrawer = () => {
    if (hasFormChanges) {
      setShowCloseConfirmation(true);
    } else {
      setIsDrawerOpen(false);
      resetForm();
    }
  };

  const confirmClose = () => {
    setShowCloseConfirmation(false);
    setIsDrawerOpen(false);
    resetForm();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl text-gray-700 font-medium">User Management</h1>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add User
        </button>
      </div>

      {/* Add drawer component */}
      <div
        className={`fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-[60] border-l border-gray-200 ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Add New User
            </h2>
            <button
              onClick={handleCloseDrawer}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className={`pl-10 mt-1 block w-full rounded-lg border shadow-sm px-4 py-2.5 transition-colors
                    ${
                      errors.username
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    }`}
                  placeholder="Enter username"
                />
              </div>
              {errors.username && (
                <p className="mt-1.5 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="pl-10 mt-1 block w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2.5
                    focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="pl-10 mt-1 block w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2.5
                    focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter name"
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors
                font-medium shadow-sm hover:shadow-md active:transform active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Adding...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add User
                </span>
              )}
            </button>
          </form>
        </div>
      </div>

      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-[55]"
          onClick={handleCloseDrawer}
        />
      )}

      {/* Add confirmation modal */}
      {confirmModal.isOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-50" />
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-medium mb-4">Confirm Action</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to {confirmModal.statusText} this user?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() =>
                    setConfirmModal({
                      isOpen: false,
                      userId: null,
                      newStatus: null,
                      statusText: '',
                    })
                  }
                  className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStatusUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add close confirmation modal */}
      {showCloseConfirmation && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-[70]" />
          <div className="fixed inset-0 z-[71] flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-medium mb-4">Confirm Close</h3>
              <p className="text-gray-600 mb-6">
                You have unsaved changes. Are you sure you want to close this
                form?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCloseConfirmation(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Close Form
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${
          isDrawerOpen ? 'pointer-events-none' : ''
        }`}
      >
        {users.map((user) => (
          <div
            key={user.userid}
            className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow relative"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900 truncate max-w-[150px]">
                  {user.name}
                </h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    getStatusInfo(user.status).color
                  }`}
                >
                  {getStatusInfo(user.status).label}
                </span>
              </div>
              <p className="text-sm text-gray-500">{user.username}</p>
            </div>
            <div className="relative" ref={dropdownRef}>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === user.userid ? null : user.userid
                  )
                }
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>
              {activeDropdown === user.userid && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => handleStatusUpdate(user.userid, 0)}
                      className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50 gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Set Active
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(user.userid, 2)}
                      className="flex items-center w-full px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      Suspend User
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(user.userid, 1)}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m4-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete User
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageUsers;
