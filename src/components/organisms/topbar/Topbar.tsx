import React from 'react';

export default function Topbar() {
  return (
    <div className="flex justify-between items-center bg-gray-700 gap-5 pl-7 pr-3.5 py-3 rounded-b-xl">
      <div className="flex items-end gap-3">
        <span className="font-semibold text-2xl leading-6">Slack Monitor</span>
        <span className="font-semibold text-sm text-gray-300 leading-none">Version 454462</span>
      </div>
      <div className="flex gap-3"></div>
    </div>
  );
}
