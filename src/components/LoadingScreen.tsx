import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#1c1c28]">
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g>
          <circle cx="50" cy="50" r="45" fill="none" stroke="#8b5cf6" strokeWidth="8" strokeLinecap="round">
            <animate 
              attributeName="stroke-dasharray" 
              from="0 282.7" 
              to="282.7 0" 
              dur="2s" 
              repeatCount="indefinite" 
            />
            <animate 
              attributeName="stroke-dashoffset" 
              from="0" 
              to="282.7" 
              dur="2s" 
              repeatCount="indefinite" 
            />
          </circle>
          <circle cx="50" cy="50" r="30" fill="#8b5cf6" opacity="0.4">
            <animate 
              attributeName="r" 
              from="30" 
              to="35" 
              dur="1s" 
              repeatCount="indefinite" 
              keyTimes="0;0.5;1" 
              values="30;35;30" 
              keySplines="0.5 0 0.5 1;0.5 0 0.5 1" 
              calcMode="spline" 
            />
            <animate 
              attributeName="opacity" 
              from="0.4" 
              to="0.2" 
              dur="1s" 
              repeatCount="indefinite" 
              keyTimes="0;0.5;1" 
              values="0.4;0.2;0.4" 
              keySplines="0.5 0 0.5 1;0.5 0 0.5 1" 
              calcMode="spline" 
            />
          </circle>
        </g>
      </svg>
      <p className="mt-4 text-purple-400 font-medium">Loading your treasures...</p>
    </div>
  );
};

export default LoadingScreen; 