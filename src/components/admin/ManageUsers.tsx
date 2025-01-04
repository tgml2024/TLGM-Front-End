import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { getAdminUsers } from '../../services/manageuserService';
import { Register } from '../../services/registerService';

interface UserFormData {
  username: string;
  password: string;
  name: string;
}

interface User {
  userid: number;
  username: string;
  name: string;
}

const ManageUsers = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    password: '',
    name: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getAdminUsers();
        setUsers(response.users);
      } catch (error) {
        toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.username) {
      newErrors.username = 'กรุณากรอกชื่อผู้ใช้';
    } else if (formData.username.length < 4 || formData.username.length > 20) {
      newErrors.username = 'ชื่อผู้ใช้ต้องมีความยาว 4-20 ตัวอักษร';
    }

    if (!formData.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (formData.password.length < 6) {
      newErrors.password = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
    }

    if (!formData.name) {
      newErrors.name = 'กรุณากรอกชื่อ';
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
      setFormData({ username: '', password: '', name: '' });
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl text-gray-700 font-medium">User Management</h1>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium"
        >
          Add User +
        </button>
      </div>

      {/* Add drawer component */}
      <div
        className={`fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Add New User</h2>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.username ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? 'กำลังเพิ่มผู้ใช้...' : 'เพิ่มผู้ใช้'}
            </button>
          </form>
        </div>
      </div>

      {/* Overlay when drawer is open */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-45"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {users.map((user) => (
          <div
            key={user.userid}
            className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium">
              {user.name.charAt(0)}
            </div>
            <div className="group relative">
              <h3 className="font-medium text-gray-900 truncate max-w-[150px]">
                {user.name}
              </h3>
              <div
                className="absolute z-10 invisible group-hover:visible bg-gray-900 text-white text-sm rounded px-2 py-1 -mt-1 
                transform -translate-y-full opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                {user.name}
              </div>
              <p className="text-sm text-gray-500">{user.username}</p>
            </div>
            <button className="ml-auto text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageUsers;
