import React from 'react';
import Image from 'next/image';

const LoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <div className="relative mb-4">
        <Image 
          src="/apple-touch-icon.png"
          alt="Loading..."
          width={100}
          height={100}
          className="animate-spin"
        />
      </div>
      <h1 className="text-xl">Loading your treasures...</h1>
    </div>
  );
};

export default LoadingScreen; 