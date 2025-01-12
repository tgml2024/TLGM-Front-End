import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import {
  beginForwarding,
  checkForwardingStatus,
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
  status: 'READY' | 'RUNNING';
  messages: any[];
  error: string | null;
  clientInfo?: {
    createdAt: string;
    lastUsed: string;
    uptime: number;
  };
  forward_interval?: number | null;
}

const AnimatedText = ({ text }: { text: string }) => (
  <p>
    {text.split('').map((char, i) => (
      <span key={i} style={{ '--i': i } as React.CSSProperties}>
        {char}
      </span>
    ))}
  </p>
);

const ForwardMessage: React.FC = () => {
  // State Management
  const [sourceGroup, setSourceGroup] = useState<SendingGroup | null>(null);
  const [destinationGroups, setDestinationGroups] = useState<ResiveGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [forwardingState, setForwardingState] = useState<ForwardingState>({
    status: 'READY',
    messages: [],
    error: null,
  });
  const [lastMessage, setLastMessage] = useState<{
    messageId: string;
    text: string;
    date: Date;
  } | null>(null);
  const [inputValue, setInputValue] = useState<string>('10');
  const [intervalError, setIntervalError] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isStopAnimating, setIsStopAnimating] = useState(false);

  // 1. Initialize client
  useEffect(() => {
    const initializeClient = async () => {
      try {
        setIsLoading(true);
        const profile = await getUserProfile();
        const userId = Number(profile.user.userid);

        // Initialize client
        await initializeForwarding(userId);

        // Check status
        const forwardingStatus = await checkForwardingStatus(userId);
        const initialStatus =
          forwardingStatus.currentForward.status === 1 ? 'RUNNING' : 'READY';

        setForwardingState((prev) => ({
          ...prev,
          status: initialStatus,
          clientInfo: forwardingStatus.clientInfo,
          forward_interval: forwardingStatus.currentForward.forward_interval,
        }));

        setInputValue(
          forwardingStatus.currentForward.forward_interval?.toString() || '10'
        );

        if (forwardingStatus.messageInfo) {
          setLastMessage(forwardingStatus.messageInfo);
        }

        // Fetch groups
        const [sendingGroups, resiveGroups] = await Promise.all([
          getSandingGroupsFromDatabase(userId.toString()),
          getGroupsFromDatabase(userId.toString()),
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
    try {
      if (!validateInputs()) return;

      // เริ่ม animation
      setIsAnimating(true);

      // รอให้ animation สร็จ
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 2000);
      });

      setIsLoading(true);
      const profile = await getUserProfile();
      const interval = Number(inputValue);

      // เริ่มส่งข้อความ
      const response = await beginForwarding({
        userId: Number(profile.user.userid),
        sourceChatId: sourceGroup!.sg_tid!,
        destinationChatIds: destinationGroups.map((group) => group.rg_tid!),
        forward_interval: interval,
      });

      if (response.success) {
        setForwardingState((prev) => ({
          ...prev,
          status: 'RUNNING',
          error: '',
        }));
        toast.success('เริ่มการส่งต่อข้อความล้ว');
      } else {
        setIsAnimating(false); // รีเซ็ต animation เมื่อเกิดข้อผิดพลาด
        setForwardingState((prev) => ({
          ...prev,
          error: 'ไม่สามารถเริ่มตารส่งต่อข้อความได้',
        }));
        toast.error('ไม่สามารถเริ่มตารส่งต่อข้อความได้');
      }
    } catch (error) {
      setIsAnimating(false); // รีเซ็ต animation เมื่อเกิดข้อผิดพลาด
      toast.error('Error starting forwarding:', error);
      setForwardingState((prev) => ({
        ...prev,
        error: 'เกิดข้อผิดพลาดในการสริ่มการส่งต่อข้อความ',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // 4. หยุดการทำงาน
  const handleStopForwarding = async () => {
    try {
      setIsStopAnimating(true);

      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 2000);
      });

      const profile = await getUserProfile();
      await stopContinuousForward(Number(profile.user.userid));

      // อัพเดท forwardingState
      setForwardingState((prev) => ({
        ...prev,
        status: 'READY',
      }));

      // รีเซ็ต animation state ของปุ่ม Forward Message
      setIsAnimating(false);
    } catch (error) {
      toast.error('Error stopping forwarding:', error);
    } finally {
      setIsStopAnimating(false);
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
        const status = await checkForwardingStatus(Number(profile.user.userid));

        if (!status.currentForward.status) {
          setForwardingState((prev) => ({ ...prev, status: 'READY' }));
        }
        if (status.messageInfo) {
          setLastMessage(status.messageInfo);
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
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6">
      <h1 className="text-2xl sm:text-5xl font-bold text-center mb-6 sm:mb-12 flex items-center justify-center gap-3 animate__animated animate__fadeIn">
        <span
          className="bg-gradient-to-r from-[#FFD700] via-[#D4AF37] to-[#B8860B] text-transparent bg-clip-text 
          drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]
          hover:drop-shadow-[0_0_15px_rgba(212,175,55,0.6)]
          transition-all duration-300
          tracking-wider
          font-extrabold
          transform hover:scale-105
          border-b-4 border-[#D4AF37]/20
          hover:border-[#D4AF37]/40
          pb-2
          relative
          after:content-['']
          after:absolute
          after:-bottom-1
          after:left-0
          after:w-full
          after:h-[2px]
          after:bg-gradient-to-r
          after:from-transparent
          after:via-[#D4AF37]
          after:to-transparent
          after:forward-shimmer
          before:content-['']
          before:absolute
          before:-inset-1
          before:bg-gradient-to-r
          before:from-[#FFD700]/0
          before:via-[#D4AF37]/10
          before:to-[#B8860B]/0
          before:forward-shine
          before:rounded-lg"
        >
          Message Forwarding
        </span>
      </h1>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-[#0A0A0A] rounded-2xl p-6 shadow-lg border border-[#D4AF37]/20 animate__animated animate__fadeInDown">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className={`h-3 w-3 rounded-full ${getStatusColor(
                  forwardingState.status
                )}`}
              />
              <span className="font-medium text-[#D4AF37]">
                Status: {forwardingState.status}
              </span>
            </div>
          </div>

          {/* Last Message Section */}
          {lastMessage && (
            <div className="mt-4 p-4 bg-black rounded-lg border border-[#D4AF37]/10 animate__animated animate__fadeInUp">
              <h4 className="text-sm font-medium text-[#C5A572] mb-2">
                Last Message
              </h4>
              <p className="text-[#D4AF37]">{lastMessage.text}</p>
              <p className="text-xs text-[#8B6B43] mt-1">
                {new Date(lastMessage.date).toLocaleString('th-TH')}
              </p>
            </div>
          )}

          {forwardingState.error && (
            <span className="text-sm px-3 py-1 bg-red-900/20 text-red-500 rounded-full animate__animated animate__shakeX">
              {forwardingState.error}
            </span>
          )}
        </div>

        {/* Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Panel: Controls */}
          <div className="bg-[#0A0A0A] rounded-2xl p-6 shadow-lg border border-[#D4AF37]/20 animate__animated animate__fadeInLeft">
            <h3 className="text-xl font-semibold mb-6 text-[#D4AF37]">
              Control
            </h3>

            {/* Interval Setting */}
            <div className="mb-6">
              <label
                className="block text-lg font-semibold text-[#FFD700] mb-2 
                tracking-wide
                drop-shadow-[0_0_3px_rgba(255,215,0,0.5)]"
              >
                Set Time (minutes)
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
                }}
                className="w-full px-4 py-3 rounded-lg 
                  bg-[#1A1A1A]
                  border-2 border-[#FFD700]
                  text-[#FFD700] 
                  text-lg
                  font-semibold
                  focus:ring-2 
                  focus:ring-[#FFD700] 
                  focus:border-transparent 
                  placeholder-[#B8860B]
                  transition-all
                  duration-300
                  hover:border-[#FFD700]/70
                  focus:shadow-[0_0_12px_rgba(255,215,0,0.4)]"
                disabled={forwardingState.status === 'RUNNING'}
                placeholder="Enter minutes"
              />
              {intervalError && (
                <p className="mt-2 text-sm text-red-500 font-medium">
                  {intervalError}
                </p>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex flex-col items-center space-y-3">
              {/* ปุ่มเริ่มส่งข้อความ - แสดงเมื่อสถานะเป็น READY */}
              {forwardingState.status === 'READY' && (
                <div className="w-fit">
                  <button
                    onClick={handleStartForwarding}
                    disabled={
                      isLoading ||
                      !!intervalError ||
                      !/^\d+$/.test(inputValue) ||
                      Number(inputValue) <= 0
                    }
                    className={`startsend ${isAnimating ? 'focus' : ''}`}
                  >
                    <div className="startsend-outline"></div>
                    <div className="startsend-state startsend-state--default">
                      <div className="startsend-icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          height="1.2em"
                          width="1.2em"
                        >
                          <g style={{ filter: 'url(#shadow)' }}>
                            <path
                              fill="currentColor"
                              d="M14.2199 21.63C13.0399 21.63 11.3699 20.8 10.0499 16.83L9.32988 14.67L7.16988 13.95C3.20988 12.63 2.37988 10.96 2.37988 9.78001C2.37988 8.61001 3.20988 6.93001 7.16988 5.60001L15.6599 2.77001C17.7799 2.06001 19.5499 2.27001 20.6399 3.35001C21.7299 4.43001 21.9399 6.21001 21.2299 8.33001L18.3999 16.82C17.0699 20.8 15.3999 21.63 14.2199 21.63ZM7.63988 7.03001C4.85988 7.96001 3.86988 9.06001 3.86988 9.78001C3.86988 10.5 4.85988 11.6 7.63988 12.52L10.1599 13.36C10.3799 13.43 10.5599 13.61 10.6299 13.83L11.4699 16.35C12.3899 19.13 13.4999 20.12 14.2199 20.12C14.9399 20.12 16.0399 19.13 16.9699 16.35L19.7999 7.86001C20.3099 6.32001 20.2199 5.06001 19.5699 4.41001C18.9199 3.76001 17.6599 3.68001 16.1299 4.19001L7.63988 7.03001Z"
                            ></path>
                            <path
                              fill="currentColor"
                              d="M10.11 14.4C9.92005 14.4 9.73005 14.33 9.58005 14.18C9.29005 13.89 9.29005 13.41 9.58005 13.12L13.16 9.53C13.45 9.24 13.93 9.24 14.22 9.53C14.51 9.82 14.51 10.3 14.22 10.59L10.64 14.18C10.5 14.33 10.3 14.4 10.11 14.4Z"
                            ></path>
                          </g>
                          <defs>
                            <filter id="shadow">
                              <feDropShadow
                                floodOpacity="0.6"
                                stdDeviation="0.8"
                                dy="1"
                                dx="0"
                              ></feDropShadow>
                            </filter>
                          </defs>
                        </svg>
                      </div>
                      <AnimatedText text="Forward Message" />
                    </div>
                    <div className="startsend-state startsend-state--sent">
                      <div className="startsend-icon">
                        <svg
                          stroke="black"
                          strokeWidth="0.5px"
                          width="1.2em"
                          height="1.2em"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g style={{ filter: 'url(#shadow)' }}>
                            <path
                              d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z"
                              fill="currentColor"
                            ></path>
                            <path
                              d="M10.5795 15.5801C10.3795 15.5801 10.1895 15.5001 10.0495 15.3601L7.21945 12.5301C6.92945 12.2401 6.92945 11.7601 7.21945 11.4701C7.50945 11.1801 7.98945 11.1801 8.27945 11.4701L10.5795 13.7701L15.7195 8.6301C16.0095 8.3401 16.4895 8.3401 16.7795 8.6301C17.0695 8.9201 17.0695 9.4001 16.7795 9.6901L11.1095 15.3601C10.9695 15.5001 10.7795 15.5801 10.5795 15.5801Z"
                              fill="currentColor"
                            ></path>
                          </g>
                        </svg>
                      </div>
                      <AnimatedText text="Forward!" />
                    </div>
                  </button>
                </div>
              )}

              {/* ปุ่มหยุดการทำงาน */}
              {forwardingState.status === 'RUNNING' && (
                <div className="w-fit">
                  <button
                    onClick={handleStopForwarding}
                    disabled={isLoading}
                    className={`stopforward ${isStopAnimating ? 'focus' : ''}`}
                  >
                    <div className="stopforward-outline"></div>
                    <div className="stopforward-state stopforward-state--default">
                      <div className="stopforward-icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          height="1em"
                          width="1em"
                        >
                          <g style={{ filter: 'url(#shadow)' }}>
                            <path
                              fill="currentColor"
                              d="M14.2199 21.63C13.0399 21.63 11.3699 20.8 10.0499 16.83L9.32988 14.67L7.16988 13.95C3.20988 12.63 2.37988 10.96 2.37988 9.78001C2.37988 8.61001 3.20988 6.93001 7.16988 5.60001L15.6599 2.77001C17.7799 2.06001 19.5499 2.27001 20.6399 3.35001C21.7299 4.43001 21.9399 6.21001 21.2299 8.33001L18.3999 16.82C17.0699 20.8 15.3999 21.63 14.2199 21.63ZM7.63988 7.03001C4.85988 7.96001 3.86988 9.06001 3.86988 9.78001C3.86988 10.5 4.85988 11.6 7.63988 12.52L10.1599 13.36C10.3799 13.43 10.5599 13.61 10.6299 13.83L11.4699 16.35C12.3899 19.13 13.4999 20.12 14.2199 20.12C14.9399 20.12 16.0399 19.13 16.9699 16.35L19.7999 7.86001C20.3099 6.32001 20.2199 5.06001 19.5699 4.41001C18.9199 3.76001 17.6599 3.68001 16.1299 4.19001L7.63988 7.03001Z"
                            ></path>
                            <path
                              fill="currentColor"
                              d="M10.11 14.4C9.92005 14.4 9.73005 14.33 9.58005 14.18C9.29005 13.89 9.29005 13.41 9.58005 13.12L13.16 9.53C13.45 9.24 13.93 9.24 14.22 9.53C14.51 9.82 14.51 10.3 14.22 10.59L10.64 14.18C10.5 14.33 10.3 14.4 10.11 14.4Z"
                            ></path>
                          </g>
                          <defs>
                            <filter id="shadow">
                              <feDropShadow
                                floodOpacity="0.5"
                                stdDeviation="0.6"
                                dy="1"
                                dx="0"
                              ></feDropShadow>
                            </filter>
                          </defs>
                        </svg>
                      </div>
                      <AnimatedText text="Stop Forwarding" />
                    </div>
                    <div className="stopforward-state stopforward-state--sent">
                      <div className="stopforward-icon">
                        <svg
                          stroke="black"
                          strokeWidth="0.5px"
                          width="1.2em"
                          height="1.2em"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g style={{ filter: 'url(#shadow)' }}>
                            <path
                              d="M12 22.75C6.07 22.75 1.25 17.93 1.25 12C1.25 6.07 6.07 1.25 12 1.25C17.93 1.25 22.75 6.07 22.75 12C22.75 17.93 17.93 22.75 12 22.75ZM12 2.75C6.9 2.75 2.75 6.9 2.75 12C2.75 17.1 6.9 21.25 12 21.25C17.1 21.25 21.25 17.1 21.25 12C21.25 6.9 17.1 2.75 12 2.75Z"
                              fill="currentColor"
                            ></path>
                            <path
                              d="M10.5795 15.5801C10.3795 15.5801 10.1895 15.5001 10.0495 15.3601L7.21945 12.5301C6.92945 12.2401 6.92945 11.7601 7.21945 11.4701C7.50945 11.1801 7.98945 11.1801 8.27945 11.4701L10.5795 13.7701L15.7195 8.6301C16.0095 8.3401 16.4895 8.3401 16.7795 8.6301C17.0695 8.9201 17.0695 9.4001 16.7795 9.6901L11.1095 15.3601C10.9695 15.5001 10.7795 15.5801 10.5795 15.5801Z"
                              fill="currentColor"
                            ></path>
                          </g>
                        </svg>
                      </div>
                      <AnimatedText text="Stopped!" />
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Groups Info */}
          <div className="space-y-6 animate__animated animate__fadeInRight">
            {/* Source Group */}
            <div className="bg-[#0A0A0A] rounded-2xl p-6 shadow-lg border border-[#D4AF37]/20">
              <h3 className="text-xl font-semibold mb-4 text-[#D4AF37] flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="#D4AF37"
                  className="w-7 h-7"
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
                <div className="bg-black rounded-lg p-4 border border-[#D4AF37]/10">
                  <p className="text-sm text-[#8B6B43]">Group ID</p>
                  <p className="font-medium text-[#D4AF37]">
                    {sourceGroup?.sg_tid || '-'}
                  </p>
                </div>
                <div className="bg-black rounded-lg p-4 border border-[#D4AF37]/10">
                  <p className="text-sm text-[#8B6B43]">Group Name</p>
                  <p className="font-medium text-[#D4AF37]">
                    {sourceGroup?.sg_name || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Destination Groups */}
            <div className="bg-[#0A0A0A] rounded-2xl p-6 shadow-lg border border-[#D4AF37]/20">
              <h3 className="text-xl font-semibold mb-4 text-[#D4AF37] flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="#D4AF37"
                  className="w-7 h-7"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                  />
                </svg>
                Receiving Group
              </h3>
              <div className="overflow-hidden rounded-xl border border-[#D4AF37]/20">
                <table className="min-w-full divide-y divide-[#D4AF37]/10">
                  <thead className="bg-black">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#8B6B43] uppercase">
                        Group Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[#8B6B43] uppercase">
                        Group ID
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#0A0A0A] divide-y divide-[#D4AF37]/10">
                    {destinationGroups.map((group) => (
                      <tr
                        key={group.rg_id}
                        className="hover:bg-black transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-[#D4AF37]">
                          {group.rg_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#D4AF37]">
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
