import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardType } from '@/app/cards/page';
import { cardToBankMapping, CardName } from '@/utils/cardMappings';
import ConfirmationScreen from './ConfirmationScreen';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (newCard: Omit<CardType, '_id'>) => void;
}

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.cardName || !newCard.bankName || !newCard.cardLimit || !newCard.billingDate) {
      alert('Please fill all required fields');
      return;
    }
    onAddCard(newCard);
    setShowConfirmation(true);
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full h-full max-w-4xl p-6 bg-gradient-to-br from-gray-800 to-gray-900 overflow-y-auto">
        <Dialog open={isOpen} onOpenChange={onClose}>
          {showConfirmation ? (
            <ConfirmationScreen onClose={onClose} />
          ) : (
            <DialogContent className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg">
              <div className="max-w-2xl mx-auto">
                <header className="mb-6">
                  <DialogTitle className="text-2xl font-bold text-white">Add New Card</DialogTitle>
                </header>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Select onValueChange={handleCardNameChange}>
                  <SelectTrigger className="w-full bg-gray-700 text-white rounded-md">
                    <SelectValue placeholder="Select a card" />
                  </SelectTrigger>
                  <SelectContent className='bg-gray-700 text-white'>
                    {Object.keys(cardToBankMapping).map((cardName) => (
                      <SelectItem key={cardName} value={cardName}>
                        {cardName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  name="bankName"
                  value={newCard.bankName}
                  readOnly
                  placeholder="Bank Name"
                  className="w-full bg-gray-700 text-white rounded-md"
                />
                <Input
                  name="cardLimit"
                  type="number"
                  value={newCard.cardLimit !== 0 ? newCard.cardLimit : ''}
                  onChange={handleInputChange}
                  placeholder="Card Limit"
                  className="w-full bg-gray-700 text-white rounded-md"
                  required
                />
                <Input
                  name="billingDate"
                  type="date"
                  value={newCard.billingDate}
                  onChange={handleInputChange}
                  placeholder="Billing Date"
                  className="w-full bg-gray-700 text-white rounded-md"
                  required
                />
                <Input
                  name="outstandingAmount"
                  type="number"
                  value={newCard.outstandingAmount !== 0 ? newCard.outstandingAmount : ''}
                  onChange={handleInputChange}
                  placeholder="Outstanding Amount"
                  className="w-full bg-gray-700 text-white rounded-md"
                  required
                />
                <Input
                  name="cardNumber"
                  value={newCard.cardNumber || ''}
                  onChange={handleInputChange}
                  placeholder="Card Number (optional)"
                  maxLength={16}
                  className="w-full bg-gray-700 text-white rounded-md"
                />

                <Button type="submit" className='w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold rounded-md shadow-md'>Add Card</Button>
              </form>
            </DialogContent>
          )}
        </Dialog>
    </div>
    </div>
  );
}
