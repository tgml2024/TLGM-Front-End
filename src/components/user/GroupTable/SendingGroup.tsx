import React from 'react';

interface SendingGroupItem {
  sgId: number;
  userId: number;
  sgName: string;
  sgTid: string;
}

interface SendingGroupProps {
  groups: SendingGroupItem[];
  onDeleteGroup: (group: SendingGroupItem) => void;
}

const SendingGroup: React.FC<SendingGroupProps> = ({
  groups,
  onDeleteGroup,
}) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        Manage sending groups
      </h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase border-b">
                Group ID
              </th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase border-b">
                Group Name
              </th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase border-b">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {groups.length > 0 ? (
              groups.map((group, index) => (
                <tr
                  key={group.sgId}
                  className={`${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-gray-100`}
                >
                  <td className="px-6 py-4 text-gray-700 border-b">
                    {group.sgTid}
                  </td>
                  <td className="px-6 py-4 text-gray-700 border-b">
                    {group.sgName}
                  </td>
                  <td className="px-6 py-4 text-gray-700 border-b">
                    <button
                      onClick={() => onDeleteGroup(group)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-4 text-center text-gray-500 border-b"
                >
                  No group found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SendingGroup;
