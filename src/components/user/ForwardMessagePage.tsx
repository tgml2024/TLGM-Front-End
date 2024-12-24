import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MdForward } from 'react-icons/md';

import {
  beginForwarding,
  checkForwardingStatus,
  getForwardingStatus,
  initializeForwarding,
  stopContinuousForward,
} from '@/services/forwardService';
import { getUserProfile } from '@/services/profileService';
import {
  getGroupsFromDatabase,
  ResiveGroup,
} from '@/services/ResiveGroupService';
import {
  getSandingGroupsFromDatabase,
  SendingGroup,
} from '@/services/SandingGroupService';

interface ForwardingState {
  status: 'IDLE' | 'RUNNING';
  messages: any[];
  error: string | null;
}

const ForwardMessage: React.FC = () => {
  // State Management
  const [sourceGroup, setSourceGroup] = useState<SendingGroup | null>(null);
  const [destinationGroups, setDestinationGroups] = useState<ResiveGroup[]>([]);
  const [interval, setInterval] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [forwardingState, setForwardingState] = useState<ForwardingState>({
    status: 'IDLE',
    messages: [],
    error: null,
  });
  const [lastMessage, setLastMessage] = useState<{
    messageId: string;
    text: string;
    date: Date;
  } | null>(null);
  const [inputValue, setInputValue] = useState<string>('1');
  const [intervalError, setIntervalError] = useState<string>('');

  // 1. Initialize client
  useEffect(() => {
    const initializeClient = async () => {
      try {
        setIsLoading(true);
        const profile = await getUserProfile();
        const userId = profile.user.userid.toString();

        // Get initial forwarding status from DB
        const forwardingStatus = await getForwardingStatus(userId);
        const initialStatus =
          forwardingStatus.status === 1 ? 'RUNNING' : 'IDLE';
        setForwardingState((prev) => ({ ...prev, status: initialStatus }));

        // เริ่มต้นเชื่อมต่อ Telegram Client
        await initializeForwarding(userId);

        // ดึงข้อมูลกลุ่ม
        const [sendingGroups, resiveGroups] = await Promise.all([
          getSandingGroupsFromDatabase(userId),
          getGroupsFromDatabase(userId),
        ]);

        if (sendingGroups.length > 0) {
          setSourceGroup(sendingGroups[0]);
        }
        setDestinationGroups(resiveGroups);
      } catch (error) {
        setForwardingState((prev) => ({
          ...prev,
          error: 'ไม่สามารถเริ่มต้นการทำงานได้',
        }));
        toast.error('ไม่สามารถเริ่มต้นการทำงานได้');
      } finally {
        setIsLoading(false);
      }
    };

    initializeClient();
  }, []);

  // Validation
  const validateInputs = (): boolean => {
    if (!sourceGroup?.sg_tid || destinationGroups.length === 0) {
      toast.error('กรุณาเลือกกลุ่มต้นทางและปลายทาง');
      return false;
    }

    // ตรวจสอบว่าเป็นตัวเลขหรือไม่
    if (!/^\d+$/.test(inputValue)) {
      toast.error('กรุณาป้อนตัวเลขเท่านั้น');
      return false;
    }

    // ตรวจสอบค่าตัวเลข
    const intervalValue = Number(inputValue);
    if (intervalValue <= 0) {
      toast.error('ระยะเวลาต้องมากกว่า 0 นาที');
      return false;
    }
    if (intervalValue > 60) {
      toast.error('ระยะเวลาต้องไม่เกิน 60 นาที');
      return false;
    }
    return true;
  };

  // 3. เริ่มส่งข้อความอัตโนมัติ
  const handleStartForwarding = async () => {
    if (!validateInputs()) return;

    try {
      setIsLoading(true);
      const profile = await getUserProfile();

      // // Log values before making API call
      // console.log('Starting forward with params:', {
      //   userId: profile.user.userid.toString(),
      //   sourceChatId: sourceGroup?.sg_tid,
      //   destinationChatIds: destinationGroups.map((group) => group.rg_tid),
      //   interval,
      // });

      await beginForwarding({
        userId: profile.user.userid.toString(),
        sourceChatId: sourceGroup!.sg_tid!,
        destinationChatIds: destinationGroups.map((group) => group.rg_tid!),
        interval,
      });

      setForwardingState((prev) => ({ ...prev, status: 'RUNNING' }));
      toast.success('เริ่มการส่งต่อข้อความอัตโนมัติแล้ว');
    } catch (error) {
      setForwardingState((prev) => ({
        ...prev,
        error: 'เกิดข้อผิดพลาดในการส่งต่อข้อความ',
      }));
      toast.error('เกิดข้อผิดพลาดในการส่งต่อข้อความ');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. หยุดการทำงาน
  const handleStopForwarding = async () => {
    try {
      setIsLoading(true);
      const profile = await getUserProfile();
      await stopContinuousForward(profile.user.userid.toString());

      // รีเซ็ตสถานะกลับไปที่ IDLE และล้างข้อความล่าสุด
      setForwardingState((prev) => ({
        ...prev,
        status: 'IDLE',
        messages: [],
        error: null,
      }));
      setLastMessage(null);

      toast.success('หยุดการส่งต่อข้อความแล้ว');
    } catch (error) {
      setForwardingState((prev) => ({
        ...prev,
        error: 'เกิดข้อผิดพลาดในการหยุดการส่งต่อข้อความ',
      }));
      toast.error('เกิดข้อผิดพลาดในการหยุดการส่งต่อข้อความ');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return 'bg-green-500 animate-pulse';
      case 'STOPPED':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  // ปรับปรุง useEffect สำหรัตรวจสอบสถานะ
  useEffect(() => {
    let statusCheckInterval: number;

    const checkStatus = async () => {
      try {
        const profile = await getUserProfile();
        const status = await checkForwardingStatus(
          profile.user.userid.toString()
        );

        if (!status.isActive) {
          setForwardingState((prev) => ({ ...prev, status: 'IDLE' }));
        }
        if (status.lastMessage) {
          setLastMessage(status.lastMessage);
        }
      } catch (error) {
        toast.error('Error checking status:', error);
      }
    };

    if (forwardingState.status === 'RUNNING') {
      // ตรวจสอบครั้งแรกทันที
      checkStatus();
      // ตั้งเวลาตรวจสอบทุก 5 วนาท
      statusCheckInterval = window.setInterval(checkStatus, 5000);
    }

    return () => {
      if (statusCheckInterval) {
        window.clearInterval(statusCheckInterval);
      }
    };
  }, [forwardingState.status]);

  // UI Components
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6 sm:mb-8 flex items-center justify-center gap-2">
        <MdForward className="text-blue-600" />
        Message Forwarding
      </h1>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white backdrop-blur-lg bg-opacity-90 rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className={`h-3 w-3 rounded-full ${getStatusColor(
                  forwardingState.status
                )}`}
              />
              <span className="font-medium text-gray-700">
                Status: {forwardingState.status}
              </span>
            </div>
          </div>

          {/* Last Message Section */}
          {lastMessage && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Last Message
              </h4>
              <p className="text-gray-800">{lastMessage.text}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(lastMessage.date).toLocaleString('th-TH')}
              </p>
            </div>
          )}

          {forwardingState.error && (
            <span className="text-sm px-3 py-1 bg-red-50 text-red-600 rounded-full">
              {forwardingState.error}
            </span>
          )}
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Panel: Controls */}
          <div className="bg-white backdrop-blur-lg bg-opacity-90 rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">
              Control
            </h3>

            {/* Interval Setting */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check interval (minutes)
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  const { value } = e.target;
                  setInputValue(value);

                  // ตรวจสอบว่าเป็นตัวเลขหรือไม่
                  if (!/^\d*$/.test(value)) {
                    setIntervalError('Please enter a number');
                    return;
                  }

                  // ตรวจสอบค่า 0
                  if (value === '0') {
                    setIntervalError('Interval must be greater than 0');
                    return;
                  }

                  // ถ้าผ่านการตรวจสอบทั้งหมด
                  setIntervalError('');
                  setInterval(Number(value));
                }}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={forwardingState.status === 'RUNNING'}
                placeholder="Enter minutes"
              />
              {intervalError && (
                <p className="mt-1 text-sm text-red-600">{intervalError}</p>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex flex-col space-y-3">
              {/* ปุ่มเริ่มส่งข้อความ - แสดงเมื่อสถานะเป็น IDLE */}
              {forwardingState.status === 'IDLE' && (
                <button
                  onClick={handleStartForwarding}
                  disabled={
                    isLoading ||
                    !!intervalError ||
                    !/^\d+$/.test(inputValue) ||
                    Number(inputValue) <= 0
                  }
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Start forwarding
                </button>
              )}

              {/* ปุ่มหยุดการทำงาน - แสดงเมื่อกถานะเป็น RUNNING */}
              {forwardingState.status === 'RUNNING' && (
                <button
                  onClick={handleStopForwarding}
                  disabled={isLoading}
                  className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Stop forwarding
                </button>
              )}
            </div>
          </div>

          {/* Right Panel: Groups Info */}
          <div className="space-y-6">
            {/* Source Group */}
            <div className="bg-white backdrop-blur-lg bg-opacity-90 rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-7 h-7 text-blue-700"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                  />
                </svg>
                Sending Group
              </h3>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Group ID</p>
                  <p className="font-medium text-gray-800">
                    {sourceGroup?.sg_tid || '-'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Group Name</p>
                  <p className="font-medium text-gray-800">
                    {sourceGroup?.sg_name || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Destination Groups */}
            <div className="bg-white backdrop-blur-lg bg-opacity-90 rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-7 h-7 text-yellow-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                  />
                </svg>
                Receiving Group
              </h3>
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Group Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Group ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {destinationGroups.map((group) => (
                      <tr key={group.rg_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {group.rg_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {group.rg_tid}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForwardMessage;
