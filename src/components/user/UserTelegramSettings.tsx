import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  FaCheck,
  FaPaperPlane,
  FaPlay,
  FaStop,
  FaTelegram,
} from 'react-icons/fa';

import { getUserProfile } from '@/services/profileService';
import {
  sendPhone,
  startClient,
  stopClient,
  verifyCode,
} from '@/services/tlg_confrm';

const UserTelegramSettings = () => {
  const [step, setStep] = useState(0); // Step 0: API Info, 1: Phone, 2: OTP
  const [phoneCodeHash, setPhoneCodeHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [, setIsClientStarted] = useState(false);
  const [, setIsAuthenticated] = useState(false);
  const [activeApiId, setActiveApiId] = useState(() => {
    return localStorage.getItem('activeApiId') || '';
  });
  const [userProfile, setUserProfile] = useState<any>(null); // Add state to store user profile

  const methods = useForm({
    defaultValues: {
      apiId: '',
      apiHash: '',
      phoneNumber: '',
      otpCode: '',
      userid: '',
      telegram_auth: 0,
    },
  });

  type FormData = {
    apiId: string;
    apiHash: string;
    phoneNumber: string;
    otpCode: string;
    userid: string; // เพิ่ม userid
    telegram_auth: number;
  };

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = methods;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileData = await getUserProfile();
        setUserProfile(profileData.user);
        setValue('apiId', profileData.user.api_id.toString());
        setValue('apiHash', profileData.user.api_hash);
        setValue('phoneNumber', profileData.user.phone);
        setValue('userid', profileData.user.userid.toString());
        setValue('telegram_auth', profileData.user.telegram_auth);

        const isAuth = profileData.user.telegram_auth === 1;
        setIsAuthenticated(isAuth);
        setIsClientStarted(isAuth);

        if (isAuth) {
          setActiveApiId(profileData.user.api_id.toString());
        }
      } catch (error) {
        toast.error('Cannot fetch profile data');
      }
    };

    fetchProfileData();
  }, [setValue]);

  // Step 0: เริ่มต้น Client
  const handleStartClient = async (data: FormData) => {
    const loadingToast = toast.loading('Starting client...');
    try {
      await startClient(data.apiId, data.apiHash, data.userid);
      // Fetch updated profile after starting client
      const profileData = await getUserProfile();
      setUserProfile(profileData.user);
      setValue('telegram_auth', profileData.user.telegram_auth);

      toast.dismiss(loadingToast);
      toast.success('Client started successfully');
      setIsClientStarted(true);
      setActiveApiId(data.apiId);
      setStep(1);
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.error || 'Cannot start client');
    }
  };

  // Step 1: ส่งเบอร์โทรศัพท์
  const handleSendPhone = async (data: FormData) => {
    try {
      const response = await sendPhone(
        data.apiId,
        data.phoneNumber,
        data.userid
      );
      setPhoneCodeHash(response.phoneCodeHash);
      setStep(2);
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send OTP');
    }
  };

  // Step 2: ยืนยัน OTP
  const handleVerifyOTP = async (data: FormData) => {
    try {
      await verifyCode(
        data.apiId,
        data.phoneNumber,
        data.otpCode,
        phoneCodeHash,
        data.userid
      );
      // Fetch updated profile after verification
      const profileData = await getUserProfile();
      setUserProfile(profileData.user);
      setValue('telegram_auth', profileData.user.telegram_auth);

      toast.success('Login successful!');
      setIsClientStarted(true);
      setIsAuthenticated(true);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to verify OTP');
    }
  };

  const handleStepSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      if (step === 0) {
        await handleStartClient(data);
      } else if (step === 1) {
        await handleSendPhone(data);
      } else if (step === 2) {
        await handleVerifyOTP(data);
      }
    } catch (error) {
      toast.error('Error in handleStepSubmit.');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonLabel = () => {
    if (step === 0)
      return (
        <>
          <FaPlay className="mr-2" /> Start
        </>
      );
    if (step === 1)
      return (
        <>
          <FaPaperPlane className="mr-2" /> Send OTP
        </>
      );
    if (step === 2)
      return (
        <>
          <FaCheck className="mr-2" /> Confirm OTP
        </>
      );
    return '';
  };

  // เพิ่ม component Stepper
  const renderStepper = () => {
    const steps = [
      { label: 'Start Client', icon: <FaPlay /> },
      { label: 'Confirm Phone', icon: <FaPaperPlane /> },
      { label: 'Confirm OTP', icon: <FaCheck /> },
    ];

    return (
      <div className="mb-8">
        <div className="flex justify-center items-center">
          {steps.map((s, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transform transition-all duration-300 ease-in-out ${
                    step >= index
                      ? 'bg-indigo-600 text-white scale-110 shadow-lg'
                      : 'bg-gray-100 text-gray-400 scale-100'
                  }`}
                >
                  <div
                    className={`text-lg transition-transform duration-300 ${
                      step >= index ? 'scale-110' : 'scale-100'
                    }`}
                  >
                    {s.icon}
                  </div>
                </div>
                <span
                  className={`text-sm mt-3 font-medium transition-all duration-300 ${
                    step >= index
                      ? 'text-indigo-600 transform translate-y-0 opacity-100'
                      : 'text-gray-400 transform -translate-y-1 opacity-70'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4 flex items-center">
                  <div className="h-1 w-full relative">
                    <div className="absolute inset-0 bg-gray-200 rounded-full"></div>
                    <div
                      className={`absolute inset-0 bg-indigo-600 rounded-full transition-all duration-500 ease-out ${
                        step > index ? 'w-full' : 'w-0'
                      }`}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Modify handleStopClient to use userProfile
  // ... existing code ...
  const handleStopClient = async () => {
    const loadingToast = toast.loading('กำลังหยุดการทำงานของ Client...');
    try {
      if (!userProfile?.userid || !userProfile?.api_id) {
        throw new Error('ไม่พบข้อมูล User Profile ที่จำเป็น');
      }

      await stopClient(
        userProfile.api_id.toString(),
        userProfile.userid.toString()
      );

      // Fetch updated profile after stopping client
      const profileData = await getUserProfile();
      setUserProfile(profileData.user);
      setValue('telegram_auth', profileData.user.telegram_auth);

      toast.dismiss(loadingToast);
      toast.success('Client stopped successfully');
      setIsClientStarted(false);
      setIsAuthenticated(false);
      setActiveApiId('');
      setStep(0);
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.error || 'Cannot stop client');
    }
  };
  // ... existing code ...

  // Add new component to show working status
  const renderWorkingStatus = () => {
    return (
      <div className="mb-8 p-6 bg-green-50 rounded-lg border-2 border-green-200 relative overflow-hidden">
        {/* Background pulse effect */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-green-400 opacity-5 animate-pulse"></div>
        </div>

        {/* Content with enhanced animations */}
        <div className="relative z-10">
          <div className="flex items-center justify-center space-x-4 mb-6">
            {/* Multiple animated dots */}
            <div className="flex space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-green-500 rounded-full"
                  style={{
                    animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite`,
                  }}
                />
              ))}
            </div>
            <h3 className="text-xl font-semibold text-green-700">
              Telegram Client is working
            </h3>
          </div>

          {/* API ID display with fade-in and slide effect */}
          <div className="flex justify-center items-center space-x-3">
            <div className="px-4 py-2 bg-green-100 rounded-lg">
              <p className="text-center text-green-700 font-medium">
                API ID: <span className="font-mono">{activeApiId}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <FormProvider {...methods}>
      <div className="space-y-6">
        <div className="w-full p-6 bg-white shadow-md rounded-md">
          <h2 className="text-3xl font-semibold text-gray-800 mb-10 text-center flex items-center justify-center gap-3">
            <FaTelegram className="text-[#0088cc]" />
            Start Telegram Client
          </h2>

          {/* แสดง working status เมื่อ telegram_auth เป็น 1 */}
          {userProfile?.telegram_auth === 1
            ? renderWorkingStatus()
            : renderStepper()}

          {/* แสดงฟอร์มเมื่อ telegram_auth เป็น 0 */}
          {userProfile?.telegram_auth === 0 && (
            <form onSubmit={handleSubmit(handleStepSubmit)}>
              {step === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label
                      htmlFor="apiId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      API ID
                    </label>
                    <input
                      {...register('apiId', { required: 'API ID is required' })}
                      id="apiId"
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.apiId && (
                      <p className="text-red-500 text-sm">
                        {errors.apiId.message}
                      </p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="apiHash"
                      className="block text-sm font-medium text-gray-700"
                    >
                      API Hash
                    </label>
                    <input
                      {...register('apiHash', {
                        required: 'API Hash is required',
                      })}
                      id="apiHash"
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.apiHash && (
                      <p className="text-red-500 text-sm">
                        {errors.apiHash.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="mb-4">
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number:
                  </label>
                  <input
                    {...register('phoneNumber', {
                      required: 'Phone number is required',
                    })}
                    id="phoneNumber"
                    type="tel"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="mb-4">
                  <label
                    htmlFor="otpCode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    OTP Code:
                  </label>
                  <input
                    {...register('otpCode', {
                      required: 'OTP Code is required',
                    })}
                    id="otpCode"
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {errors.otpCode && (
                    <p className="text-red-500 text-sm">
                      {errors.otpCode.message}
                    </p>
                  )}
                </div>
              )}
            </form>
          )}

          {/* ปรับปรุงการแสดงปุ่ม */}
          <div className="flex justify-center gap-4">
            {userProfile?.telegram_auth === 0 ? (
              <button
                type="submit"
                disabled={isLoading}
                className={`mt-4 w-full md:w-auto md:min-w-[200px] inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
                onClick={handleSubmit(handleStepSubmit)}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Starting....
                  </>
                ) : (
                  getButtonLabel()
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopClient}
                className="mt-4 w-full md:w-auto md:min-w-[200px] inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                <FaStop className="mr-2" /> Stop
              </button>
            )}
          </div>
        </div>
      </div>
    </FormProvider>
  );
};

export default UserTelegramSettings;
