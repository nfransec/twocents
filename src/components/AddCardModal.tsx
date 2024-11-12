import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardType } from '@/app/cards/page';
import { cardToBankMapping, CardName } from '@/utils/cardMappings';
import ConfirmationScreen from './ConfirmationScreen';
import './AddCardModal.css';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (newCard: Omit<CardType, '_id'>) => void;
}

const bankLogos = {
  'HDFC': 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fdribbble.com%2Fshots%2F22321923-HDFC-LOGO-DESIGN&psig=AOvVaw0WPYk79taYi6cAW7JjL5jm&ust=1731502789466000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCMDQ6tfs1okDFQAAAAAdAAAAABAE',
  'Axis': 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.stickpng.com%2Fimg%2Ficons-logos-emojis%2Fbank-logos%2Faxis-bank-thumbnail&psig=AOvVaw3oWH45d9F5sSiocye-46ER&ust=1731502814688000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCOCjhuXs1okDFQAAAAAdAAAAABAE',
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

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true); // Show modal when isOpen is true
    } else {
      const timer = setTimeout(() => setShowModal(false), 300); // Delay hiding for transition
      return () => clearTimeout(timer); // Cleanup timer
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCard.cardName || !newCard.bankName || !newCard.cardLimit || !newCard.billingDate) {
      alert('Please fill all required fields');
      return;
    }
    onAddCard(newCard);
    setShowConfirmation(true);
  };

  const handleClose = () => {
    onClose(); // Call the onClose prop
  };

  return (
    <div className={`modal-overlay ${showModal ? 'open' : ''}`}>
        <div className={`modal-content ${showModal && isOpen ? 'slide-up' : ''}`}>
          <Dialog open={isOpen} onOpenChange={handleClose}>
            { showConfirmation ? (
              <ConfirmationScreen onClose={handleClose} />
            ) : (
              <DialogContent className='bg-gradient-to-br h-3/4 from-gray-800 to-gray-900 shadow-lg p-6 outline-none'>
                <DialogTitle className='text-2xl font-bold'>Add Your Card</DialogTitle>
                <form onSubmit={handleSubmit} className='flex flex-col gap-8'>
                  <Select onValueChange={handleCardNameChange}>
                    <SelectTrigger className='w-full bg-gray-700 rounded-none text-emerald-500'>
                      <SelectValue placeholder='select your card'></SelectValue>
                    </SelectTrigger>
                    <SelectContent className='w-full bg-gray-700 text-white rounded-none'>
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
                  className="w-full bg-gray-700 text-bold text-emerald-500 rounded-md"
                />

                <Input
                  name="cardLimit"
                  type="number"
                  value={newCard.cardLimit !== 0 ? newCard.cardLimit : ''}
                  onChange={handleInputChange}
                  placeholder="Card Limit"
                  className="w-full bg-gray-700 text-bold text-emerald-500 rounded-md"
                  required
                />
                <Input
                  name="billingDate"
                  type="date"
                  value={newCard.billingDate}
                  onChange={handleInputChange}
                  placeholder="Billing Date"
                  className="w-full bg-gray-700 text-bold text-emerald-500 rounded-md"
                  required
                />
                <Input
                  name="outstandingAmount"
                  type="number"
                  value={newCard.outstandingAmount !== 0 ? newCard.outstandingAmount : ''}
                  onChange={handleInputChange}
                  placeholder="Outstanding Amount"
                  className="w-full bg-gray-700 text-bold text-emerald-500 rounded-md"
                  required
                />
                <Input
                  name="cardNumber"
                  value={newCard.cardNumber || ''}
                  onChange={handleInputChange}
                  placeholder="Card Number (optional)"
                  maxLength={16}
                  className="w-full bg-gray-700 text-bold text-emerald-500 rounded-md"
                />

                <Button type="submit" className='w-full mt-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold rounded-none shadow-md'>Add Card</Button>
    
                </form>
              </DialogContent>
            )}
          </Dialog>
        </div>
    </div>
  );
}
