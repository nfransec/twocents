'use client'

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface User {
    _id: string;
    username: string;
    email: string;
    isAdmin: boolean;
    fullName: string;
}

interface Card {
    _id: string;
    cardName: string;
    bankName: string;
    cardLimit: number;
    billingDate: string;
    outstandingAmount: number;
    userId: string;
}

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [editingCard, setEditingCard] = useState<Card | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchUsers();
        fetchCards();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users');
        }
    };

    const fetchCards = async () => {
        try {
            const response = await axios.get('/api/admin/cards');
            setCards(response.data);
        } catch (error) {
            console.error('Error fetching cards:', error);
            toast.error('Failed to fetch cards');
        }
    };

    const resetPassword = async (userId: string) => {
        try {
            await axios.post(`/api/admin/reset-password/${userId}`);
            toast.success('Password reset successfully');
        } catch (error) {
            console.error('Error resetting password:', error);
            toast.error('Failed to reset password');
        }
    };

    const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
        try {
            await axios.put(`/api/admin/toggle-admin/${userId}`, { isAdmin: !currentStatus });
            fetchUsers(); // Refresh user list
            toast.success('Admin status updated');
        } catch (error) {
            console.error('Error toggling admin status:', error);
            toast.error('Failed to update admin status');
        }
    };

    const deleteUser = async (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`/api/admin/users/${userId}`);
                fetchUsers(); // Refresh user list
                fetchCards(); // Refresh cards list
                toast.success('User deleted successfully');
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user');
            }
        }
    };

    const deleteCard = async (cardId: string) => {
        if(window.confirm('Are you sure you want to delete this card?')) {
            try {
                await axios.delete(`/api/admin/cards/${cardId}`);
                fetchCards();
                toast.success('Card deleted successfully');
            } catch (error) {
                console.error('Error deleting card:', error);
                toast.error('Failed to delete card');
            }
        }
    };

    const updateCard = async (card: Card) => {
        try {
            await axios.put(`/api/admin/cards/${card._id}`, card);
            fetchCards();
            setEditingCard(null);
            toast.success('Card updated successfully');
        } catch (error) {
            console.error('Error updating card:', error);
            toast.error('Failed to update card');
        }
    };

    return (
        <div className='container mx-auto p-2 sm:p-4 text-white w-full sm:w-[95%] md:w-[90%] lg:w-[85%] xl:w-[80%]'>
            <h1 className='text-xl sm:text-2xl font-bold mb-4 text-green-400'>Admin Dashboard</h1>
            
            <h2 className='text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-2 sm:mb-4'>Users</h2>
            <div className='overflow-x-auto'>
                <table className='min-w-full bg-dark-300 outline outline-1 outline-green-400 rounded-lg text-xs sm:text-sm'>
                    <thead>
                        <tr>
                            <th className='py-1 sm:py-2 px-1 sm:px-4 border-b'>Name</th>
                            <th className='py-1 sm:py-2 px-1 sm:px-4 border-b'>Username</th>
                            <th className='py-1 sm:py-2 px-1 sm:px-4 border-b'>Email</th>
                            <th className='py-1 sm:py-2 px-1 sm:px-4 border-b'>Admin</th>
                            <th className='py-1 sm:py-2 px-1 sm:px-4 border-b'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id} className="hover:bg-green-500">
                                <td className='py-1 sm:py-2 px-1 sm:px-4 border-b'>{user.fullName}</td>
                                <td className='py-1 sm:py-2 px-1 sm:px-4 border-b'>{user.username}</td>
                                <td className='py-1 sm:py-2 px-1 sm:px-4 border-b'>{user.email}</td>
                                <td className='py-1 sm:py-2 px-1 sm:px-4 border-b'>{user.isAdmin ? 'Yes' : 'No'}</td>
                                <td className='py-1 sm:py-2 px-1 sm:px-4 border-b'>
                                    <button onClick={() => resetPassword(user._id)} className='mr-1 sm:mr-2 bg-blue-500 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm'>
                                        Reset
                                    </button>
                                    <button onClick={() => toggleAdminStatus(user._id, user.isAdmin)} className='mr-1 sm:mr-2 bg-yellow-500 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm'>
                                        Toggle
                                    </button>
                                    <button onClick={() => deleteUser(user._id)} className='bg-red-500 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm'>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h2 className="text-lg sm:text-xl font-semibold mt-4 sm:mt-6 mb-2">Cards</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-dark-300 outline outline-1 outline-green-400 rounded-lg text-xs sm:text-sm">
                    <thead className="bg-dark-300">
                        <tr>
                            <th className="py-1 sm:py-2 px-1 sm:px-4 border-b text-left">Card</th>
                            <th className="py-1 sm:py-2 px-1 sm:px-4 border-b text-left">Bank</th>
                            <th className="py-1 sm:py-2 px-1 sm:px-4 border-b text-left">Limit</th>
                            <th className="py-1 sm:py-2 px-1 sm:px-4 border-b text-left">Bill Date</th>
                            <th className="py-1 sm:py-2 px-1 sm:px-4 border-b text-left">Outstanding</th>
                            <th className="py-1 sm:py-2 px-1 sm:px-4 border-b text-left">User</th>
                            <th className="py-1 sm:py-2 px-1 sm:px-4 border-b text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cards.map((card) => (
                            <tr key={card._id} className="hover:bg-green-500">
                                <td className="py-1 sm:py-2 px-1 sm:px-4 border-b">{card.cardName}</td>
                                <td className="py-1 sm:py-2 px-1 sm:px-4 border-b">{card.bankName}</td>
                                <td className="py-1 sm:py-2 px-1 sm:px-4 border-b">₹{card.cardLimit.toLocaleString()}</td>
                                <td className="py-1 sm:py-2 px-1 sm:px-4 border-b">{new Date(card.billingDate).toLocaleDateString()}</td>
                                <td className="py-1 sm:py-2 px-1 sm:px-4 border-b">₹{card.outstandingAmount.toLocaleString()}</td>
                                <td className="py-1 sm:py-2 px-1 sm:px-4 border-b">{users.find(u => u._id === card.userId)?.username || 'Unknown'}</td>
                                <td className="py-1 sm:py-2 px-1 sm:px-4 border-b">
                                    <button onClick={() => setEditingCard(card)} className="mr-1 sm:mr-2 bg-blue-500 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm hover:bg-blue-600">
                                        Edit
                                    </button>
                                    <button onClick={() => deleteCard(card._id)} className="bg-red-500 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm hover:bg-red-600">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {editingCard && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white p-4 rounded-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4 text-black">Edit Card</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            updateCard(editingCard);
                        }}>
                            <div className="mb-2">
                                <label className="block text-black">Card Name:</label>
                                <input
                                    type="text"
                                    value={editingCard.cardName}
                                    onChange={(e) => setEditingCard({...editingCard, cardName: e.target.value})}
                                    className="border p-1 w-full text-black"
                                />
                            </div>
                            <div className="mb-2">
                                <label className="block text-black">Bank Name:</label>
                                <input
                                    type="text"
                                    value={editingCard.bankName}
                                    onChange={(e) => setEditingCard({...editingCard, bankName: e.target.value})}
                                    className="border p-1 w-full text-black"
                                />
                            </div>
                            <div className="mb-2">
                                <label className="block text-black">Card Limit:</label>
                                <input
                                    type="number"
                                    value={editingCard.cardLimit}
                                    onChange={(e) => setEditingCard({...editingCard, cardLimit: Number(e.target.value)})}
                                    className="border p-1 w-full text-black"
                                />
                            </div>
                            <div className="mb-2">
                                <label className="block text-black">Billing Date:</label>
                                <input
                                    type="date"
                                    value={editingCard.billingDate.split('T')[0]}
                                    onChange={(e) => setEditingCard({...editingCard, billingDate: e.target.value})}
                                    className="border p-1 w-full text-black"
                                />
                            </div>
                            <div className="mb-2">
                                <label className="block text-black">Outstanding Amount:</label>
                                <input
                                    type="number"
                                    value={editingCard.outstandingAmount}
                                    onChange={(e) => setEditingCard({...editingCard, outstandingAmount: Number(e.target.value)})}
                                    className="border p-1 w-full text-black"
                                />
                            </div>
                            <div className="flex justify-end mt-4">
                                <button type="button" onClick={() => setEditingCard(null)} className="mr-2 bg-gray-300 px-3 py-1 rounded text-black">Cancel</button>
                                <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
