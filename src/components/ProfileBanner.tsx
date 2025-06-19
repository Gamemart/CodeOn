
import React from 'react';

interface ProfileBannerProps {
  bannerType: string | null;
  bannerValue: string | null;
  className?: string;
}

const ProfileBanner = ({ bannerType, bannerValue, className = "" }: ProfileBannerProps) => {
  const defaultBanner = '#3B82F6';
  
  const getBannerStyle = () => {
    if (!bannerValue) {
      return { backgroundColor: defaultBanner };
    }

    switch (bannerType) {
      case 'color':
        return { backgroundColor: bannerValue };
      case 'gradient':
        return { background: bannerValue };
      case 'image':
        return { 
          backgroundImage: `url(${bannerValue})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      default:
        return { backgroundColor: defaultBanner };
    }
  };

  return (
    <div 
      className={`w-full ${className}`}
      style={getBannerStyle()}
    />
  );
};

export default ProfileBanner;
