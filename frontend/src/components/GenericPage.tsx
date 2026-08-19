import React from 'react';

export default function GenericPage({ title, description }: { title: string, description: string }) {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-gray-400 text-sm mt-1">{description}</p>
      </div>
      <div className="bg-[#141C2F] border border-gray-800 rounded-xl p-10 flex items-center justify-center h-64 text-gray-500">
        This page is under construction. Backend endpoints for this feature are not yet implemented.
      </div>
    </div>
  );
}
