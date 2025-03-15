import React from 'react';
import Image from 'next/image';
import coinImage from '../../public/assets/images/apple-touch-icon.png'

const LoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#1c1c28]">
      <div className="animate-spin">
        <Image 
          src={coinImage} 
          alt="Spinning coin" 
          width={100} 
          height={100}
          priority
        />
      </div>
      <p className="mt-4 text-emerald-500 font-medium">Loading your treasures...</p>
    </div>
  );
};

export default LoadingScreen; 