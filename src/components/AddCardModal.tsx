'use client'

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardType } from '@/types/card';
import { bankToCardsMapping, Bank, CardName } from '@/utils/cardMappings';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (newCard: Omit<CardType, '_id'>) => void;
}

type FeedbackState = 'idle' | 'loading' | 'success' | 'error';

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
      <h2 className="text-xl font-semibold text-white mb-2">
        {state === 'loading' ? 'Adding your card...' : message}
      </h2>
      {state === 'loading' && (
        <p className="text-slate-300">Please wait while we process your request</p>
      )}
    </div>
  );
};

export function AddCardModal({ isOpen, onClose, onAddCard }: AddCardModalProps) {
  const [newCard, setNewCard] = useState<Omit<CardType, '_id'>>({
    cardName: '',
    bankName: '',
    cardLimit: 0,
    billingDate: '',
    outstandingAmount: 0,
    isPaid: false
  });
  
  const [availableCards, setAvailableCards] = useState<CardName[]>([]);
  const [feedbackState, setFeedbackState] = useState<FeedbackState>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update available cards when bank changes
  useEffect(() => {
    if (newCard.bankName) {
      setAvailableCards(bankToCardsMapping[newCard.bankName as Bank] || []);
      // Reset card name when bank changes
      setNewCard(prev => ({
        ...prev,
        cardName: ''
      }));
    } else {
      setAvailableCards([]);
    }
  }, [newCard.bankName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCard(prev => ({
      ...prev,
      [name]: name === 'cardLimit' || name === 'outstandingAmount' ? Number(value) : value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBankChange = (value: Bank) => {
    setNewCard(prev => ({
      ...prev,
      bankName: value
    }));
    
    // Clear bank name error
    if (errors.bankName) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.bankName;
        return newErrors;
      });
    }
  };

  const handleCardNameChange = (value: CardName) => {
    setNewCard(prev => ({
      ...prev,
      cardName: value,
      imageUrl: `/${value.toLowerCase().replace(/\s+/g, '-')}-${newCard.bankName.toLowerCase().replace(/\s+/g, '-')}.png`
    }));
    
    // Clear card name error
    if (errors.cardName) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.cardName;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!newCard.bankName) {
      newErrors.bankName = 'Bank name is required';
    }
    
    if (!newCard.cardName) {
      newErrors.cardName = 'Card type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      setFeedbackState('error');
      setFeedbackMessage('Please select bank and card type');
      
      // Auto-dismiss error after 2 seconds
      setTimeout(() => {
        setFeedbackState('idle');
      }, 2000);
      
      return;
    }
    
    // Set default values for optional fields
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    
    const updatedCard = {
      ...newCard,
      cardLimit: newCard.cardLimit || 0,
      outstandingAmount: newCard.outstandingAmount || 0,
      billingDate: newCard.billingDate || nextMonth.toISOString(),
      isPaid: newCard.outstandingAmount === 0
    };
    
    // Show loading state
    setFeedbackState('loading');
    
    try {
      await onAddCard(updatedCard);
      
      // Show success state
      setFeedbackState('success');
      setFeedbackMessage('Card Added Successfully!');
      
      // Auto-dismiss after 1.5 seconds
      setTimeout(() => {
        setFeedbackState('idle');
        onClose();
        resetForm();
      }, 1500);
    } catch (error) {
      console.error('Error adding card:', error);
      
      // Show error state
      setFeedbackState('error');
      setFeedbackMessage('Failed to add card. Please try again.');
      
      // Auto-dismiss error after 2 seconds
      setTimeout(() => {
        setFeedbackState('idle');
      }, 2000);
    }
  };

  const resetForm = () => {
    setNewCard({
      cardName: '',
      bankName: '',
      cardLimit: 0,
      billingDate: '',
      outstandingAmount: 0,
      isPaid: false
    });
    setErrors({});
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
            onClick={feedbackState === 'idle' ? onClose : undefined}
          />
          
          {/* Modal */}
          <motion.div 
            className="fixed bottom-0 left-0 right-0 z-50 bg-[#1c1c28] rounded-t-3xl overflow-hidden flex flex-col max-h-[90vh]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {feedbackState !== 'idle' ? (
              <div className="h-[70vh]">
                <FeedbackScreen state={feedbackState} message={feedbackMessage} />
              </div>
            ) : (
              <>
                <div className="px-6 pt-8 pb-4 overflow-y-auto flex-grow">
                  <h1 className="text-2xl font-bold text-white mb-6">Add New Card</h1>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-medium text-white">Select your bank<span className="text-red-500">*</span></p>
                        {errors.bankName && (
                          <p className="text-red-500 text-sm flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.bankName}
                          </p>
                        )}
                      </div>
                      <Select
                        value={newCard.bankName}
                        onValueChange={(value: Bank) => handleBankChange(value)}
                      >
                        <SelectTrigger className={cn(
                          "bg-[#252536] border-gray-700 text-white h-12 rounded-xl",
                          errors.bankName && "border-red-500"
                        )}>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#252536] border-gray-700 text-white">
                          {Object.keys(bankToCardsMapping).map((bank) => (
                            <SelectItem key={bank} value={bank}>
                              {bank}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-medium text-white">Your card type<span className="text-red-500">*</span></p>
                        {errors.cardName && (
                          <p className="text-red-500 text-sm flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.cardName}
                          </p>
                        )}
                      </div>
                      <Select
                        value={newCard.cardName}
                        onValueChange={(value: CardName) => handleCardNameChange(value)}
                        disabled={!newCard.bankName}
                      >
                        <SelectTrigger className={cn(
                          "bg-[#252536] border-gray-700 text-white h-12 rounded-xl",
                          errors.cardName && "border-red-500"
                        )}>
                          <SelectValue placeholder={newCard.bankName ? "Select" : "Select bank first"} />
                        </SelectTrigger>
                        <SelectContent className="bg-[#252536] border-gray-700 text-white">
                          {availableCards.map((card) => (
                            <SelectItem key={card} value={card}>
                              {card}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-white">Card Limit</p>
                      <Input
                        id="cardLimit"
                        name="cardLimit"
                        type="number"
                        placeholder="Enter card limit"
                        value={newCard.cardLimit !== 0 ? newCard.cardLimit : ''}
                        onChange={handleInputChange}
                        className="bg-[#252536] border-gray-700 text-white h-12 rounded-xl"
                      />
                    </div>
                    
                    {/* Billing Date and Outstanding Amount in the same row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-white">Billing Date</p>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="bg-[#252536] border-gray-700 text-white h-12 rounded-xl w-full justify-start font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newCard.billingDate ? format(new Date(newCard.billingDate), "MMM d, yyyy") : <span>Select date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-[#252536] border-gray-700">
                            <Calendar
                              mode="single"
                              selected={newCard.billingDate ? new Date(newCard.billingDate) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  setNewCard(prev => ({ ...prev, billingDate: date.toISOString() }));
                                }
                              }}
                              initialFocus
                              className="bg-[#252536] text-white"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-white">Outstanding</p>
                        <Input
                          id="outstandingAmount"
                          name="outstandingAmount"
                          type="number"
                          placeholder="Enter amount"
                          value={newCard.outstandingAmount !== 0 ? newCard.outstandingAmount : ''}
                          onChange={handleInputChange}
                          className="bg-[#252536] border-gray-700 text-white h-12 rounded-xl"
                        />
                      </div>
                    </div>
                  </form>
                </div>
                
                {/* Button container with extra space at bottom */}
                <div className="px-6 py-6 mb-16">
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white h-12 rounded-xl text-xl font-medium"
                  >
                    Confirm
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
