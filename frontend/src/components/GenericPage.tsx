import React from 'react';

export default function GenericPage({ title, description }: { title: string, description: string }) {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10 text-white">
      <div className="pb-6 border-b border-[#89CFF0]/20">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{title}</h1>
        <p className="text-[#8EA6C8] text-xs sm:text-sm mt-1">{description}</p>
      </div>
      <div className="liquid-glass-card rounded-3xl p-10 flex items-center justify-center h-64 text-[#8EA6C8] text-sm shadow-[0_20px_50px_rgba(137,207,240,0.12)] font-medium border border-[#89CFF0]/20">
        This section is reserved for future enterprise extensions.
      </div>
    </div>
  );
}
