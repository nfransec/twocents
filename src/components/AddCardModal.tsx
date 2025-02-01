'use client'

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardType } from '@/app/cards/page';
import { cardToBankMapping, CardName } from '@/utils/cardMappings';
import { X, CheckCircle, CreditCard } from 'lucide-react';
import './AddCardModal.css';
import { toast } from 'react-hot-toast';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (newCard: Omit<CardType, '_id'>) => void;
}

const bankLogos = {
  'HDFC': 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fdribbble.com%2Fshots%2F22321923-HDFC-LOGO-DESIGN&psig=AOvVaw0WPYk79taYi6cAW7JjL5jm&ust=1731502789466000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCMDQ6tfs1okDFQAAAAAdAAAAABAE',
  'Axis': 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.stickpng.com%2Fimg%2Ficons-logos-emojis%2Fbank-logos%2Faxis-bank-thumbnail&psig=AOvVaw3oWH45d9F5sSiocye-46ER&ust=1731502814688000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCOCjhuXs1okDFQAAAAAdAAAAABAE',
}

const ConfirmationScreen = () => (
  <DialogContent className="bg-gradient-to-b from-slate-900 to-slate-800 border-0">
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
      <h2 className="text-xl font-semibold text-white mb-2">Card Added Successfully!</h2>
      <p className="text-slate-300">Your new card has been added to your account.</p>
    </div>
  </DialogContent>
);

export function AddCardModal({ isOpen, onClose, onAddCard }: AddCardModalProps) {
  const [newCard, setNewCard] = useState<Omit<CardType, '_id'>>({
    cardName: '',
    bankName: '',
    cardLimit: 0,
    billingDate: '',
    outstandingAmount: 0,
    cardNumber: ''
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
    } else {
      const timer = setTimeout(() => setShowModal(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCard(prev => ({
      ...prev,
      [name]: name === 'cardLimit' || name === 'outstandingAmount' ? Number(value) : value
    }));
  };

  const handleCardNameChange = (value: CardName) => {
    setNewCard(prev => ({
      ...prev,
      cardName: value,
      bankName: cardToBankMapping[value],
      imageUrl: `/${value.toLowerCase().replace(/\s+/g, '-')}-${cardToBankMapping[value].toLowerCase().replace(/\s+/g, '-')}.png`
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.cardName || !newCard.bankName || !newCard.cardLimit || !newCard.billingDate) {
      toast.error('Please fill all required fields');
      return;
    }
    await onAddCard(newCard);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      onClose();
      setNewCard({
        cardName: '',
        bankName: '',
        cardLimit: 0,
        billingDate: '',
        outstandingAmount: 0,
        cardNumber: ''
      });
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {showConfirmation ? (
        <ConfirmationScreen />
      ) : (
        <DialogContent className="bg-gradient-to-b from-slate-900 to-slate-800 border-0 sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
            <DialogTitle className="text-xl font-semibold text-white">Add Your Card</DialogTitle>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Select Card</label>
              <Select onValueChange={handleCardNameChange}>
                <SelectTrigger className="w-full bg-slate-800/50 border-slate-700 text-slate-200 h-11 rounded-lg focus:ring-emerald-500">
                  <SelectValue placeholder="Choose your card type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.keys(cardToBankMapping).map((cardName) => (
                    <SelectItem 
                      key={cardName} 
                      value={cardName}
                      className="text-slate-200 focus:bg-slate-700 focus:text-white"
                    >
                      {cardName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Bank Name</label>
              <Input
                name="bankName"
                value={newCard.bankName}
                readOnly
                className="bg-slate-800/50 border-slate-700 text-emerald-500 h-11 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Card Limit</label>
              <Input
                name="cardLimit"
                type="number"
                value={newCard.cardLimit !== 0 ? newCard.cardLimit : ''}
                onChange={handleInputChange}
                className="bg-slate-800/50 border-slate-700 text-slate-200 h-11 rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Billing Date</label>
              <Input
                name="billingDate"
                type="date"
                value={newCard.billingDate}
                onChange={handleInputChange}
                className="bg-slate-800/50 border-slate-700 text-slate-200 h-11 rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Outstanding Amount</label>
              <Input
                name="outstandingAmount"
                type="number"
                value={newCard.outstandingAmount !== 0 ? newCard.outstandingAmount : ''}
                onChange={handleInputChange}
                className="bg-slate-800/50 border-slate-700 text-slate-200 h-11 rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Card Number (Optional)</label>
              <Input
                name="cardNumber"
                value={newCard.cardNumber || ''}
                onChange={handleInputChange}
                maxLength={16}
                className="bg-slate-800/50 border-slate-700 text-slate-200 h-11 rounded-lg"
                placeholder="•••• •••• •••• ••••"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
            >
              Add Card
            </Button>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}
