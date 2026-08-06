import React from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';

export const AnnouncementBar: React.FC = () => {
  const { announcementText } = useMarketplace();

  if (!announcementText) return null;

  return (
    <div className="bg-indigo-900 text-indigo-100 text-xs py-2 px-4 text-center font-medium tracking-wide border-b border-indigo-800">
      <span>{announcementText}</span>
    </div>
  );
};
