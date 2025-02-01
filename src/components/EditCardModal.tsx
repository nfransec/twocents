'use client'

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardType } from '@/types/card';
import { cardToBankMapping, CardName } from '@/utils/cardMappings';
import { X } from 'lucide-react';
import './AddCardModal.css'; // We can reuse the same CSS

interface EditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (card: CardType) => void;
  card: CardType;
}

export function EditCardModal({ isOpen, onClose, onEdit, card }: EditCardModalProps) {
  const [editedCard, setEditedCard] = useState<CardType>(card);

  useEffect(() => {
    setEditedCard(card);
  }, [card]);

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
    if (!editedCard.cardName || !editedCard.bankName || !editedCard.cardLimit || !editedCard.billingDate) {
      alert('Please fill all required fields');
      return;
    }
    onEdit(editedCard);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-b from-slate-900 to-slate-800 border-0 sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
          <DialogTitle className="text-xl font-semibold text-white">Edit Card</DialogTitle>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Card Type</label>
            <Select onValueChange={handleCardNameChange} defaultValue={editedCard.cardName}>
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
              value={editedCard.bankName}
              readOnly
              className="bg-slate-800/50 border-slate-700 text-emerald-500 h-11 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Card Limit</label>
            <Input
              name="cardLimit"
              type="number"
              value={editedCard.cardLimit}
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
              value={editedCard.billingDate}
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
              value={editedCard.outstandingAmount}
              onChange={handleInputChange}
              className="bg-slate-800/50 border-slate-700 text-slate-200 h-11 rounded-lg"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Card Number (Optional)</label>
            <Input
              name="cardNumber"
              value={editedCard.cardNumber || ''}
              onChange={handleInputChange}
              maxLength={16}
              className="bg-slate-800/50 border-slate-700 text-slate-200 h-11 rounded-lg"
              placeholder="•••• •••• •••• ••••"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              onClick={onClose}
              className="flex-1 h-11 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 h-11 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200 ease-in-out transform hover:scale-[1.02]"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
