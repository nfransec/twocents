import React, { useEffect } from 'react';

interface ConfirmationScreenProps {
  onClose: () => void;
}

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Show for 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white min-h-screen z-50">
      <div className="text-xl font-bold mb-4">
        <span className='animate-pulse'>Card Addded</span>
        <span className='animate-pulse text-emerald-500'> Successfully!</span>
    </div>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  );
};

export default ConfirmationScreen;

