'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ArrowLeft, User, Mail, Phone, ChevronRight, Link2, MessageSquare, Flag, FileText, Info, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import  GmailIntegration  from '@/components/GmailIntegration';

export interface UserType {
  _id: string
  fullName: string
  email: string
  phoneNumber: string
  username: string
  profilePicture: string
  dateOfBirth?: string
}

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [user, setUser] = useState<UserType>({
    _id: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    username: '',
    profilePicture: 'https://github.com/shadcn.png',
    dateOfBirth: ''
  });
  const appVersion = 'v1.15.0325';
  const [activePage, setActivePage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserType>>({
    fullName: '',
    email: '',
    username: '',
    dateOfBirth: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
        router.push('/login')
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        toast.error('An unknown error occurred')
      }
    } else {
      toast.error('An unknown error occurred')
    }
  }

  const getUserDetails = useCallback(async () => {
    if (user._id) return;
    setIsLoading(true)
    try {
      const res = await axios.get('/api/users/me')
      const userData = res.data.data
      console.log('User data from API:', userData)
      setUser(userData)
      
      setEditedUser({
        fullName: userData.fullName || '',
        email: userData.email || '',
        username: userData.username || '',
        //dateOfBirth: userData.dateOfBirth || '',
      })
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }, [user, router])

  useEffect(() => {
    getUserDetails()
  }, [getUserDetails])

  useEffect(() => {
    if (user) {
      setEditedUser({
        fullName: user.fullName || '',
        email: user.email || '',
        username: user.username || '',
        //dateOfBirth: user.dateOfBirth || '',
      });
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      const response = await axios.get('/api/users/logout');
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout');
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 0 || nameParts[0] === '') return 'U';
    
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };

  // Extract first and last name from fullName
  const getFirstName = () => {
    if (!user.fullName) return '';
    const nameParts = user.fullName.trim().split(' ');
    return nameParts[0] || '';
  };

  const getLastName = () => {
    if (!user.fullName) return '';
    const nameParts = user.fullName.trim().split(' ');
    return nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  };

  // Format date of birth if available
  const formatDateOfBirth = () => {
    if (!user.dateOfBirth) return '';
    
    // Try to format the date as DD/MM/YYYY
    try {
      const date = new Date(user.dateOfBirth);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return user.dateOfBirth; // Return as is if parsing fails
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
    setIsEditing(true);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      console.log('Sending data to API:', editedUser)
      const response = await axios.put('/api/users/update', editedUser);
      if (response.data.success) {
        toast.success('Profile updated successfully');
        
        const updatedUser = response.data.data;
        console.log('Response data:', updatedUser)
        
        setUser(prev => ({
          ...prev,
          fullName: updatedUser.fullName || prev.fullName,
          email: updatedUser.email || prev.email,
          username: updatedUser.username || prev.username,
          //dateOfBirth: updatedUser.dateOfBirth || prev.dateOfBirth,
        }));
        
        setIsEditing(false);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
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
        <p className="mt-4 text-emerald-500 font-medium">Loading your treasures...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1c1c28] text-white pb-20 relative overflow-hidden">
      <AnimatePresence mode="wait">
        {activePage === null ? (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="p-4 flex items-center">
              <Button 
                variant="ghost" 
                className="p-2" 
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-6 w-6 text-white" />
              </Button>
              <h1 className="text-2xl font-bold ml-2">Profile</h1>
            </div>

            <div className="p-4">
              <motion.div 
                className="bg-[#252536] rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Account */}
                <div 
                  className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#2a2a3c] cursor-pointer"
                  onClick={() => setActivePage('account')}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
                      <User className="h-5 w-5 text-black" />
                    </div>
                    <span className="ml-4 text-white font-medium">Account</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                {/* Join WhatsApp Channel */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#2a2a3c] cursor-pointer">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white">
                        <path d="M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.2.56-1.24 1.1-1.7 1.12-.46.02-.47.36-2.96-.73-2.49-1.09-3.99-3.75-4.11-3.92-.12-.17-.96-1.38-.92-2.61.05-1.22.69-1.8.95-2.04.24-.26.51-.29.68-.26h.47c.15 0 .36-.06.55.45l.69 1.87c.06.13.1.28.01.44l-.27.41-.39.42c-.12.12-.26.25-.12.5.12.26.62 1.09 1.32 1.78.91.88 1.71 1.17 1.95 1.3.24.14.39.12.54-.04l.81-.94c.19-.25.35-.19.58-.11l1.67.88M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10c-1.97 0-3.8-.57-5.35-1.55L2 22l1.55-4.65A9.969 9.969 0 0 1 2 12 10 10 0 0 1 12 2m0 2a8 8 0 0 0-8 8c0 1.72.54 3.31 1.46 4.61L4.5 19.5l2.89-.96A7.95 7.95 0 0 0 12 20a8 8 0 0 0 8-8 8 8 0 0 0-8-8z"/>
                      </svg>
                    </div>
                    <span className="ml-4 text-white font-medium">Join WhatsApp Channel</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                {/* Link Your Gmail */}
                <div 
                  className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#2a2a3c] cursor-pointer"
                  onClick={() => setActivePage('gmail')}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-yellow-500">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <span className="text-white font-medium">Link Your Gmail</span>
                      <div className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded inline-block ml-2">
                        Action Required
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                {/* Advanced Options */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#2a2a3c] cursor-pointer">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-gray-500">
                        <path d="M12 3c-4.97 0-9 4.03-9 9v7c0 1.1.9 2 2 2h4v-8H5v-1c0-3.87 3.13-7 7-7s7 3.13 7 7v1h-4v8h4c1.1 0 2-.9 2-2v-7c0-4.97-4.03-9-9-9z"/>
                      </svg>
                    </div>
                    <span className="ml-4 text-white font-medium">Advanced Options</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-gray-400">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                </div>

                {/* Refer Your Friends */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#2a2a3c] cursor-pointer">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-yellow-500">
                        <path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z"/>
                      </svg>
                    </div>
                    <span className="ml-4 text-white font-medium">Refer Your Friends</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                {/* Report an Issue */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#2a2a3c] cursor-pointer">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Flag className="h-5 w-5 text-yellow-500" />
                    </div>
                    <span className="ml-4 text-white font-medium">Report an Issue</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                {/* Terms and Conditions */}
                <div 
                  className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#2a2a3c] cursor-pointer"
                  onClick={() => setActivePage('terms')}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-yellow-500">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                      </svg>
                    </div>
                    <span className="ml-4 text-white font-medium">Terms and Conditions</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>

                {/* Privacy Policy */}
                <div 
                  className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#2a2a3c] cursor-pointer"
                  onClick={() => setActivePage('privacy')}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-yellow-500">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                      </svg>
                    </div>
                    <span className="ml-4 text-white font-medium">Privacy Policy</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </motion.div>

              {/* Logout Button */}
              <div 
                className="flex justify-center mt-8 cursor-pointer"
                onClick={handleLogout}
              >
                <div className="flex items-center text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 mr-2 text-red-500">
                    <path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/>
                  </svg>
                  <span className="text-lg font-medium">Logout</span>
                </div>
              </div>

              {/* App Version */}
              <div className="mt-4 text-center text-gray-500 text-sm">
                <p>App Version {appVersion}</p>
              </div>
            </div>
          </motion.div>
        ) : null}
        
        {activePage === 'account' && (
          <motion.div
            key="account"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="p-4"
          >
            <button onClick={() => setActivePage(null)}>
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex flex-col items-center justify-center mt-4 mb-8">
              <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center text-2xl font-bold text-black mb-4">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.fullName || 'User'} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(user.fullName)
                )}
              </div>
              <h2 className="text-xl font-bold">My Profile</h2>
              <p className="text-gray-400">View your personal details</p>
            </div>

            <div className="px-2 py-0">
              <div className="mb-4">
                <p className="text-gray-400 mb-1">Name</p>
                <input
                  type="text"
                  name="fullName"
                  value={editedUser.fullName}
                  onChange={handleInputChange}
                  className="p-4 w-full bg-[#252536] rounded-lg border border-gray-700 text-white"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="mb-4">
                <p className="text-gray-400 mb-1">Username</p>
                <input
                  type="text"
                  name="username"
                  value={editedUser.username}
                  onChange={handleInputChange}
                  className="p-4 w-full bg-[#252536] rounded-lg border border-gray-700 text-white"
                  placeholder="Enter your username"
                  disabled
                />
              </div>
              
              <div className="mb-4">
                <p className="text-gray-400 mb-1">Email</p>
                <input
                  type="email"
                  name="email"
                  value={editedUser.email}
                  onChange={handleInputChange}
                  className="p-4 w-full bg-[#252536] rounded-lg border border-gray-700 text-white"
                  placeholder="Enter your email"
                />
              </div>
              
              {/* <div className="mb-4">
                <p className="text-gray-400 mb-1">Date of Birth</p>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={editedUser.dateOfBirth ? new Date(editedUser.dateOfBirth).toISOString().split('T')[0] : ''}
                  onChange={handleInputChange}
                  className="p-4 w-full bg-[#252536] rounded-lg border border-gray-700 text-white"
                  placeholder="Enter your date of birth"
                />
              </div> */}

              {isEditing && (
                <Button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="w-full bg-purple-700 hover:bg-purple-600 text-white mt-4"
                >
                  {isSaving ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        )}
        
        {activePage === 'gmail' && (
          <motion.div
            key="gmail"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="p-4"
          >
            <div className="flex flex-col">
              <button 
                onClick={() => setActivePage(null)}
                className="flex items-center text-white mb-6"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span>Back</span>
              </button>

              <h1 className="text-2xl font-bold mb-4">Link Your Gmail</h1>
              
              <Card className="bg-[#2a2a3c] border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Gmail Integration</CardTitle>
                  <CardDescription className="text-gray-400">Connect your Gmail account to enable email features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <GmailIntegration />
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {activePage === 'terms' && (
          <motion.div
            key="terms"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="p-4"
          >
            <div className="flex flex-col">
              <button 
                onClick={() => setActivePage(null)}
                className="flex items-center text-white mb-6"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span>Back</span>
              </button>

              <h1 className="text-2xl font-bold mb-4">Terms and Conditions</h1>
              
              <Card className="bg-[#2a2a3c] border-gray-700">
                <CardContent className="pt-6">
                  <div className="space-y-4 text-white">
                    <h2 className="text-xl font-semibold">TwoCent Terms of Service</h2>
                    <p className="text-gray-300">Last Updated: March 2025</p>
                    
                    <div className="space-y-4 mt-4">
                      <h3 className="text-lg font-medium">1. Introduction</h3>
                      <p>Welcome to TwoCent ("we," "our," or "us"). By accessing or using our application, you agree to be bound by these Terms and Conditions.</p>
                      
                      <h3 className="text-lg font-medium">2. Services Description</h3>
                      <p>TwoCent is a financial management application that helps users track their credit card information, billing cycles, and payment due dates. Our service may analyze your email to extract relevant credit card information but does not store sensitive data such as card numbers, CVV codes, or PINs.</p>
                      
                      <h3 className="text-lg font-medium">3. Account Registration</h3>
                      <p>To use TwoCent, you must create an account with accurate information. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
                      
                      <h3 className="text-lg font-medium">4. User Responsibilities</h3>
                      <p>You agree to:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Provide accurate information</li>
                        <li>Use the service for lawful purposes only</li>
                        <li>Not attempt to access data not intended for you</li>
                        <li>Not use the service to conduct fraudulent activities</li>
                      </ul>
                      
                      <h3 className="text-lg font-medium">5. Data Usage</h3>
                      <p>We collect and process information as described in our Privacy Policy. By using TwoCent, you consent to such processing and warrant that all data provided by you is accurate.</p>
                      
                      <h3 className="text-lg font-medium">6. Intellectual Property</h3>
                      <p>All content, features, and functionality of TwoCent, including but not limited to text, graphics, logos, and software, are owned by us and protected by intellectual property laws.</p>
                      
                      <h3 className="text-lg font-medium">7. Disclaimer of Warranties</h3>
                      <p>TwoCent is provided "as is" without warranties of any kind. We do not guarantee that the service will be error-free or uninterrupted.</p>
                      
                      <h3 className="text-lg font-medium">8. Limitation of Liability</h3>
                      <p>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>
                      
                      <h3 className="text-lg font-medium">9. Termination</h3>
                      <p>We may terminate or suspend your account and access to TwoCent at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.</p>
                      
                      <h3 className="text-lg font-medium">10. Changes to Terms</h3>
                      <p>We may revise these Terms at any time. By continuing to use TwoCent after such changes, you agree to be bound by the revised Terms.</p>
                      
                      <h3 className="text-lg font-medium">11. Governing Law</h3>
                      <p>These Terms shall be governed by the laws of the jurisdiction in which TwoCent operates, without regard to its conflict of law provisions.</p>
                      
                      <h3 className="text-lg font-medium">12. Contact Information</h3>
                      <p>For questions about these Terms, please contact us at <span className="text-yellow-500">nfransec@gmail.com</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {activePage === 'privacy' && (
          <motion.div
            key="privacy"
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="p-4"
          >
            <div className="flex flex-col">
              <button 
                onClick={() => setActivePage(null)}
                className="flex items-center text-white mb-6"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                <span>Back</span>
              </button>

              <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
              
              <Card className="bg-[#2a2a3c] border-gray-700">
                <CardContent className="pt-6">
                  <div className="space-y-4 text-white">
                    <h2 className="text-xl font-semibold">TwoCent Privacy Policy</h2>
                    <p className="text-gray-300">Last Updated: March 2025</p>
                    
                    <div className="space-y-4 mt-4">
                      <h3 className="text-lg font-medium">1. Introduction</h3>
                      <p>At TwoCent, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.</p>
                      
                      <h3 className="text-lg font-medium">2. Information We Collect</h3>
                      <p>We collect the following types of information:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Account Information:</strong> Name, email address and username.</li>
                        <li><strong>Credit Card Information:</strong> Card type, issuing bank, billing date, and payment due date. We do NOT collect or store card numbers, CVV codes, PINs, or other sensitive authentication data.</li>
                        <li><strong>Email Data:</strong> With your permission, we may scan your emails to extract credit card billing information.</li>
                        <li><strong>Usage Data:</strong> Information about how you use our application.</li>
                      </ul>
                      
                      <h3 className="text-lg font-medium">3. How We Use Your Information</h3>
                      <p>We use the collected information for various purposes:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>To provide and maintain our service</li>
                        <li>To notify you about upcoming credit card payment due dates</li>
                        <li>To improve our application and user experience</li>
                        <li>To communicate with you about updates or changes to our service</li>
                        <li>To detect, prevent, and address technical issues</li>
                      </ul>
                      
                      <h3 className="text-lg font-medium">4. Data Security</h3>
                      <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
                      
                      <h3 className="text-lg font-medium">5. Email Scanning</h3>
                      <p>If you choose to connect your email account, our application will scan your emails to identify credit card statements and extract relevant billing information. We do not read or store the content of your personal emails unrelated to credit card statements.</p>
                      
                      <h3 className="text-lg font-medium">6. Data Sharing and Disclosure</h3>
                      <p>We do not sell your personal information. We may share your information in the following situations:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>With service providers who assist us in operating our application</li>
                        <li>To comply with legal obligations</li>
                        <li>To protect and defend our rights or property</li>
                        <li>With your consent or at your direction</li>
                      </ul>
                      
                      <h3 className="text-lg font-medium">7. Your Data Rights</h3>
                      <p>Depending on your location, you may have rights regarding your personal information, including:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Accessing your personal information</li>
                        <li>Correcting inaccurate information</li>
                        <li>Deleting your information</li>
                        <li>Restricting or objecting to processing</li>
                        <li>Data portability</li>
                      </ul>
                      
                      <h3 className="text-lg font-medium">8. Children's Privacy</h3>
                      <p>Our service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children.</p>
                      
                      <h3 className="text-lg font-medium">9. Changes to This Privacy Policy</h3>
                      <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.</p>
                      
                      <h3 className="text-lg font-medium">10. Contact Us</h3>
                      <p>If you have any questions about this Privacy Policy, please contact us at <span className="text-yellow-500">nfransec@gmail.com</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
