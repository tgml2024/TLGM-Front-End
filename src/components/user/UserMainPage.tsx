import 'react-phone-number-input/style.css';

import { useQuery } from '@tanstack/react-query';
import { Form, Formik } from 'formik';
import React from 'react';
import PhoneInput from 'react-phone-number-input';

import { getUserProfile } from '@/services/profileService';
import withAuth from '@/utils/withAuth';

const UserMainPage = () => {
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getUserProfile,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const initialValues = {
    api_id: profileData?.user.api_id || '',
    api_hash: profileData?.user.api_hash || '',
    phone: profileData?.user.phone || '',
  };

  const handleSubmit = (values: typeof initialValues) => {
    console.log(values); // TODO: Implement save functionality
  };

  return (
    <div className="pt-10 max-w-3xl mx-auto p-4 bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-400 p-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white text-2xl font-semibold">
              Connect Telegram
            </span>
          </div>
        </div>

        {/* Form Content */}
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ values, setFieldValue }) => (
            <Form className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-blue-500 text-sm font-medium mb-1 block">
                      API ID
                    </label>
                    <input
                      type="text"
                      name="api_id"
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors"
                      value={values.api_id}
                      onChange={(e) => setFieldValue('api_id', e.target.value)}
                    />
                  </div>

                  <div className="flex-1">
                    <label className="text-blue-500 text-sm font-medium mb-1 block">
                      API Hash
                    </label>
                    <input
                      type="text"
                      name="api_hash"
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors"
                      value={values.api_hash}
                      onChange={(e) =>
                        setFieldValue('api_hash', e.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <a href="#" className="text-sm text-blue-500 hover:underline">
                    Click Here To Get API ID and API Hash
                  </a>
                </div>

                <div>
                  <label className="text-blue-500 text-sm font-medium mb-1 block">
                    Phone
                  </label>
                  <PhoneInput
                    international
                    defaultCountry="TH"
                    value={values.phone}
                    onChange={(value) => setFieldValue('phone', value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 transition-colors"
                    placeholder="Enter phone number"
                  />
                  <small className="text-gray-500 block mt-1">
                    Please enter your phone number in international format.
                  </small>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-blue-400 text-white px-8 py-2 rounded-full hover:from-blue-400 hover:to-blue-300 transition-colors text-sm font-medium"
                >
                  SAVE
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default withAuth(UserMainPage, 'user');
