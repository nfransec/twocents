'use client'

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { CardType } from '@/types/card';
import { CheckCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

interface DeleteCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (cardId: string) => void;
  card: CardType;
}

type FeedbackState = 'confirm' | 'loading' | 'success' | 'error';

const FeedbackScreen = ({ state, message }: { state: FeedbackState; message: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center h-full">
      {state === 'loading' && (
        <Loader2 className="w-16 h-16 text-purple-500 mb-4 animate-spin" />
      )}
      {state === 'success' && (
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>
      )}
      {state === 'error' && (
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>
      )}
      {state === 'confirm' && (
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <Trash2 className="w-12 h-12 text-red-500" />
          </div>
        </div>
      )}
      <h2 className="text-xl font-semibold text-white mb-2">
        {message}
      </h2>
      {state === 'loading' && (
        <p className="text-slate-300">Please wait while we process your request</p>
      )}
    </div>
  );
};

export function DeleteCardModal({ isOpen, onClose, onDelete, card }: DeleteCardModalProps) {
  const [feedbackState, setFeedbackState] = useState<FeedbackState>('confirm');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  
  useEffect(() => {
    if (card) {
      setFeedbackMessage(`Are you sure you want to delete your ${card.bankName || ''} ${card.cardName || ''} card?`);
    }
  }, [card]);

  const handleDelete = async () => {
    // Show loading state
    setFeedbackState('loading');
    setFeedbackMessage('Deleting your card...');
    
    try {
      await onDelete(card._id);
      
      // Show success state
      setFeedbackState('success');
      setFeedbackMessage('Card Deleted Successfully!');
      
      // Auto-dismiss after 1.5 seconds
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error deleting card:', error);
      
      // Show error state
      setFeedbackState('error');
      setFeedbackMessage('Failed to delete card. Please try again.');
      
      // Auto-dismiss error after 2 seconds
      setTimeout(() => {
        setFeedbackState('confirm');
        setFeedbackMessage(`Are you sure you want to delete your ${card.bankName || ''} ${card.cardName || ''} card?`);
      }, 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={feedbackState === 'confirm' ? onClose : undefined}
          />
          
          {/* Modal - smaller height for delete confirmation */}
          <motion.div 
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#1c1c28] rounded-t-3xl overflow-hidden flex flex-col"
            style={{ height: '50vh' }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex-grow flex flex-col justify-center">
              <FeedbackScreen state={feedbackState} message={feedbackMessage} />
            </div>
            
            {feedbackState === 'confirm' && (
              <div className="px-6 py-6 mb-16 flex space-x-4">
                <Button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 bg-gray-700 hover:bg-gray-600 text-white h-12 rounded-xl text-lg font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleDelete}
                  className="w-1/2 bg-red-600 hover:bg-red-700 text-white h-12 rounded-xl text-lg font-medium"
                >
                  Delete
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 