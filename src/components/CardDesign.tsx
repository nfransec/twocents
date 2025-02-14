import React from 'react';
import Image from 'next/image';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

type CardType = {
  _id: string;
  cardName: string;
  bankName: string;
  cardLimit: number;
  outstandingAmount: number;
  billingDate: string;
  cardNumber?: string;
  isPaid?: boolean;
  paidAmount?: number;
  paymentDate?: Date;
};

type CardDesignProps = {
  card: CardType;
  isFlipped: boolean;
  onClick: () => void;
  onEdit: (card: CardType) => void;
  onDelete: (cardId: string) => void;
};

export default function CardDesign({ card, isFlipped, onClick, onEdit, onDelete }: CardDesignProps) {
  const { theme } = useTheme()
  
  return (
    <div className="relative w-full h-48 perspective" onClick={onClick}>
      <div className={`w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front of the card */}
        <div className="absolute w-full h-full rounded-lg shadow-lg overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 p-6 backface-hidden">
          <h3 className="text-xl font-bold text-light-100 mb-2">{card.cardName}</h3>
          <p className="text-sm text-light-200 mb-4">{card.bankName}</p>
          <p className="text-sm text-light-300">Card Number: {card.cardNumber ? 
            card.cardNumber.slice(-4).padStart(card.cardNumber.length, '*') : 
            'Not available'
          }</p>
        </div>
        
        {/* Back of the card */}
        <div className="absolute w-full h-full rounded-lg shadow-lg overflow-hidden bg-dark-200 p-4 backface-hidden rotate-y-180 text-light-100">
          <h3 className="text-xl text-success-500 font-bold mb-2">{card.cardName}</h3>
          <p className="text-light-300">Bank: {card.bankName}</p>
          <p className="text-light-300">Credit Limit: ₹{card.cardLimit.toLocaleString()}</p>
          <p className="text-light-300">Outstanding: ₹{card.outstandingAmount.toLocaleString()}</p>
          <p className="text-light-300">Billing Date: {new Date(card.billingDate).toLocaleDateString()}</p>
          <p className="text-light-300">Remaining Credit Limit: ₹{(card.cardLimit - (card.paidAmount ?? 0)).toLocaleString()}</p>
          <p className="text-light-300">Payment Status: {card.isPaid && card.paymentDate ? 
            `Paid on ${new Date(card.paymentDate).toLocaleDateString()}` : 
            'Pending'
          }</p>
          <div className="flex justify-end space-x-2">
            <Button onClick={(e) => { e.stopPropagation(); onEdit(card) }} size="sm" className="">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button onClick={(e) => { e.stopPropagation(); onDelete(card._id) }} size="sm" className="">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

