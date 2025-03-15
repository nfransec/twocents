'use client'

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardType } from '@/types/card';
import { bankToCardsMapping, Bank, CardName, cardToBankMapping } from '@/utils/cardMappings';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface EditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (editedCard: CardType) => void;
  card: CardType;
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
        {state === 'loading' ? 'Updating your card...' : message}
      </h2>
      {state === 'loading' && (
        <p className="text-slate-300">Please wait while we process your request</p>
      )}
    </div>
  );
};

export function EditCardModal({ isOpen, onClose, onEdit, card }: EditCardModalProps) {
  const [editedCard, setEditedCard] = useState<CardType>(card);
  const [availableCards, setAvailableCards] = useState<CardName[]>([]);
  const [feedbackState, setFeedbackState] = useState<FeedbackState>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form when card prop changes
  useEffect(() => {
    setEditedCard(card);
  }, [card]);

  // Update available cards when bank changes
  useEffect(() => {
    if (editedCard.bankName) {
      setAvailableCards(bankToCardsMapping[editedCard.bankName as Bank] || []);
    } else {
      setAvailableCards([]);
    }
  }, [editedCard.bankName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedCard(prev => ({
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
    setEditedCard(prev => ({
      ...prev,
      bankName: value,
      // Reset card name when bank changes
      cardName: ''
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
    setEditedCard(prev => ({
      ...prev,
      cardName: value,
      imageUrl: `/${value.toLowerCase().replace(/\s+/g, '-')}-${editedCard.bankName.toLowerCase().replace(/\s+/g, '-')}.png`
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
    
    if (!editedCard.bankName) {
      newErrors.bankName = 'Bank name is required';
    }
    
    if (!editedCard.cardName) {
      newErrors.cardName = 'Card type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) {
      setFeedbackState('error');
      setFeedbackMessage('Please fill all required fields');
      
      // Auto-dismiss error after 2 seconds
      setTimeout(() => {
        setFeedbackState('idle');
      }, 2000);
      
      return;
    }
    
    // Show loading state
    setFeedbackState('loading');
    
    try {
      await onEdit(editedCard);
      
      // Show success state
      setFeedbackState('success');
      setFeedbackMessage('Card Updated Successfully!');
      
      // Auto-dismiss after 1.5 seconds
      setTimeout(() => {
        setFeedbackState('idle');
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error updating card:', error);
      
      // Show error state
      setFeedbackState('error');
      setFeedbackMessage('Failed to update card. Please try again.');
      
      // Auto-dismiss error after 2 seconds
      setTimeout(() => {
        setFeedbackState('idle');
      }, 2000);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Select date";
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
                  <h1 className="text-2xl font-bold text-white mb-6">Edit card</h1>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-medium text-white">Bank name <span className="text-red-500">*</span></p>
                        {errors.bankName && (
                          <p className="text-red-500 text-sm flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.bankName}
                          </p>
                        )}
                      </div>
                      <Select
                        value={editedCard.bankName}
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
                        <p className="text-lg font-medium text-white">Card type <span className="text-red-500">*</span></p>
                        {errors.cardName && (
                          <p className="text-red-500 text-sm flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {errors.cardName}
                          </p>
                        )}
                      </div>
                      <Select
                        value={editedCard.cardName}
                        onValueChange={(value: CardName) => handleCardNameChange(value)}
                        disabled={!editedCard.bankName}
                      >
                        <SelectTrigger className={cn(
                          "bg-[#252536] border-gray-700 text-white h-12 rounded-xl",
                          errors.cardName && "border-red-500"
                        )}>
                          <SelectValue placeholder={editedCard.bankName ? "Select" : "Select bank first"} />
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
                        value={editedCard.cardLimit !== 0 ? editedCard.cardLimit : ''}
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
                              {editedCard.billingDate ? formatDate(editedCard.billingDate) : <span>Select date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-[#252536] border-gray-700">
                            <Calendar
                              mode="single"
                              selected={editedCard.billingDate ? new Date(editedCard.billingDate) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  setEditedCard(prev => ({ ...prev, billingDate: date.toISOString() }));
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
                          value={editedCard.outstandingAmount !== 0 ? editedCard.outstandingAmount : ''}
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
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white h-12 rounded-xl text-lg font-medium"
                  >
                    Save Changes
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
