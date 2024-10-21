import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardType } from '@/app/cards/page';
import { cardToBankMapping, CardName } from '@/utils/cardMappings';

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
    imageUrl: '',
    cardNumber: ''
  });

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
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] text-white">
        <DialogHeader>
          <DialogTitle>Add New Card</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select onValueChange={handleCardNameChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a card" />
            </SelectTrigger>
            <SelectContent className='text-white'>
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
          />
          <Input
            name="cardLimit"
            type="number"
            value={newCard.cardLimit}
            onChange={handleInputChange}
            placeholder="Card Limit"
            required
          />
          <Input
            name="billingDate"
            type="date"
            value={newCard.billingDate}
            onChange={handleInputChange}
            placeholder="Billing Date"
            required
          />
          <Input
            name="outstandingAmount"
            type="number"
            value={newCard.outstandingAmount}
            onChange={handleInputChange}
            placeholder="Outstanding Amount"
            required
          />
          <Input
            name="cardNumber"
            value={newCard.cardNumber || ''}
            onChange={handleInputChange}
            placeholder="Card Number (optional)"
            maxLength={16}
          />
          <Button type="submit" className='bg-green-500 hover:bg-green-700 w-full'>Add Card</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
