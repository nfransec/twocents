import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardType } from '@/app/cards/page';
import { cardToBankMapping, CardName } from '@/utils/cardMappings';

interface EditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditCard: (editedCard: CardType) => void;
  card: CardType;
}

export function EditCardModal({ isOpen, onClose, onEditCard, card }: EditCardModalProps) {
  const [editedCard, setEditedCard] = useState<CardType>(card);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedCard(prev => ({
      ...prev,
      [name]: name === 'cardLimit' || name === 'outstandingAmount' ? Number(value) : value
    }));
  };

  const handleCardNameChange = (value: CardName) => {
    setEditedCard(prev => ({
      ...prev,
      cardName: value,
      bankName: cardToBankMapping[value],
      imageUrl: `/${value.toLowerCase().replace(/\s+/g, '-')}-${cardToBankMapping[value].toLowerCase().replace(/\s+/g, '-')}.png`
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEditCard(editedCard);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[395px] text-white">
        <DialogHeader>
          <DialogTitle>Edit Card</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select onValueChange={handleCardNameChange} defaultValue={editedCard.cardName}>
            <SelectTrigger>
              <SelectValue placeholder="Select a card" />
            </SelectTrigger>
            <SelectContent className='text-white bg-dark-300'>
              {Object.keys(cardToBankMapping).map((cardName) => (
                <SelectItem key={cardName} value={cardName}>
                  {cardName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            name="bankName"
            value={editedCard.bankName}
            readOnly
            placeholder="Bank Name"
          />
          <Input
            name="cardNumber"
            value={editedCard.cardNumber || ''}
            onChange={handleInputChange}
            placeholder="Card Number (optional)"
            maxLength={16}
          />
          <Input
            name="cardLimit"
            type="number"
            value={editedCard.cardLimit}
            onChange={handleInputChange}
            placeholder="Card Limit"
            required
          />
          <Input
            name="billingDate"
            type="date"
            value={editedCard.billingDate.split('T')[0]}
            onChange={handleInputChange}
            placeholder="Billing Date"
            required
          />
          <Input
            name="outstandingAmount"
            type="number"
            value={editedCard.outstandingAmount}
            onChange={handleInputChange}
            placeholder="Outstanding Amount"
            required
          />
          <Button type="submit" className='bg-green-500 hover:bg-green-600 w-full'>Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
