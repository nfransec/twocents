'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button'
import { Loader2, UserCircle, Bell, Mail, MoreHorizontal, ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react'

interface User {
  _id: string
  username: string
  email: string
  isAdmin: boolean
  lastLogin?: string | Date | null
}

interface Card {
  _id: string
  cardName: string
  bankName: string
  cardLimit: number
  billingDate: string
  outstandingAmount: number
  userId: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active')
  const router = useRouter()

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setLoading(true)
        const response = await axios.get('/api/users/me')
        
        if (response.data.data && response.data.data.isAdmin) {
          setIsAdmin(true)
          // Fetch admin data
          fetchUsers()
          fetchCards()
        } else {
          // Not an admin, redirect to home
          toast.error('You do not have admin access')
          router.push('/')
        }
      } catch (error) {
        console.error('Error checking admin status:', error)
        toast.error('Authentication error')
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [router])

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users')
      setUsers(response.data.users)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    }
  }

  const fetchCards = async () => {
    try {
      const response = await axios.get('/api/admin/cards')
      setCards(response.data.cards)
    } catch (error) {
      console.error('Error fetching cards:', error)
      toast.error('Failed to load cards')
    }
  }

  const updateUser = async (userId: string, data: Partial<User>) => {
    try {
      await axios.put(`/api/admin/users/${userId}`, data)
      toast.success('User updated successfully')
      fetchUsers()
      setEditingUser(null)
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user')
    }
  }

  const deleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/admin/users/${userId}`)
        toast.success('User deleted successfully')
        fetchUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
        toast.error('Failed to delete user')
      }
    }
  }

  const updateCard = async (cardId: string, data: Partial<Card>) => {
    try {
      await axios.put(`/api/admin/cards/${cardId}`, data)
      toast.success('Card updated successfully')
      fetchCards()
      setEditingCard(null)
    } catch (error) {
      console.error('Error updating card:', error)
      toast.error('Failed to update card')
    }
  }

  const deleteCard = async (cardId: string) => {
    if (confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/admin/cards/${cardId}`)
        toast.success('Card deleted successfully')
        fetchCards()
      } catch (error) {
        console.error('Error deleting card:', error)
        toast.error('Failed to delete card')
      }
    }
  }

  // Helper to get cards for a user
  const getUserCards = (userId: string) => cards.filter(card => card.userId === userId)

  // Helper to determine if user is inactive
  const now = new Date();
  const isInactive = (user: User) => {
    if (!user.lastLogin) return true;
    const diff = (now.getTime() - new Date(user.lastLogin).getTime()) / (1000 * 60 * 60 * 24); // days
    return diff > 60;
  };
  const activeUsers = users.filter(user => !isInactive(user));
  const inactiveUsers = users.filter(user => isInactive(user));

  // Helper to format last login
  const formatLastLogin = (date: string | Date | null | undefined) => {
    if (!date) return 'Never';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Never';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1c1c28] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-2">Loading admin panel...</span>
      </div>
    )
  }

  if (!isAdmin) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-[#181824] text-white flex flex-col">
      {/* Top nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-[#232336] bg-[#1c1c28]">
        <div className="flex items-center gap-8">
          <span className="font-bold text-lg">Home</span>
          <span className="text-gray-400 cursor-pointer">Notifications</span>
          <span className="text-gray-400 cursor-pointer">Messages</span>
          <span className="text-gray-400 cursor-pointer flex items-center gap-1">More <MoreHorizontal className="h-4 w-4" /></span>
        </div>
      </nav>
      {/* Content */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Users</h1>
        <div className="flex gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'active' ? 'bg-blue-700 text-white' : 'bg-[#232336] text-gray-400'}`}
            onClick={() => setActiveTab('active')}
          >
            {activeUsers.length} Active
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'inactive' ? 'bg-blue-700 text-white' : 'bg-[#232336] text-gray-400'}`}
            onClick={() => setActiveTab('inactive')}
          >
            {inactiveUsers.length} Inactive
          </button>
        </div>
        <div className="bg-[#232336] rounded-2xl p-0 overflow-hidden">
          {(activeTab === 'active' ? activeUsers : inactiveUsers).map(user => (
            <div key={user._id} className="flex flex-col border-b border-[#232336] hover:bg-[#232346]/60 transition">
              <div className="flex flex-col md:flex-row md:items-center px-6 py-4 gap-2 md:gap-6 w-full overflow-x-auto">
                {/* Avatar and username */}
                <div className="flex items-center gap-3 min-w-[140px] flex-shrink-0">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#2d2d44]"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{user.username}</span>
                      <span className="text-blue-400 text-xs">✔</span>
                    </div>
                    <span className="text-gray-400 text-xs">@{user.username}</span>
                  </div>
                </div>
                {/* Info columns, wrap on small screens */}
                <div className="flex flex-wrap flex-1 gap-x-6 gap-y-1 md:gap-y-0 min-w-0">
                  <div className="min-w-[120px] flex flex-col">
                    <span className="text-sm">{formatLastLogin(user.lastLogin)}</span>
                    <span className="text-xs text-gray-400">Last Login</span>
                  </div>
                  <div className="min-w-[160px] flex flex-col">
                    <span className="text-sm truncate max-w-[140px]">{user.email}</span>
                    <span className="text-xs text-gray-400">Email</span>
                  </div>
                  <div className="min-w-[80px] flex flex-col">
                    <span className={user.isAdmin ? 'text-green-400 font-semibold' : 'text-gray-400'}>{user.isAdmin ? 'Admin' : 'User'}</span>
                    <span className="text-xs text-gray-400">Role</span>
                  </div>
                  <div className="min-w-[60px] flex flex-col">
                    <span className="text-sm">{getUserCards(user._id).length}</span>
                    <span className="text-xs text-gray-400">Cards</span>
                  </div>
                </div>
                {/* Actions and chevron, always visible */}
                <div className="flex items-center gap-2 mt-2 md:mt-0 ml-auto flex-shrink-0">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setEditingUser(user)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => deleteUser(user._id)}
                  >
                    Delete
                  </Button>
                  <button
                    className="ml-2 text-gray-400 hover:text-white"
                    onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
                  >
                    {expandedUser === user._id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              {/* Expandable credit cards section */}
              {expandedUser === user._id && (
                <div className="bg-[#1c1c28] px-4 md:px-12 py-4">
                  <h4 className="text-md font-semibold mb-2">Credit Cards</h4>
                  {getUserCards(user._id).length === 0 ? (
                    <div className="text-gray-400 text-sm">No cards found for this user.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getUserCards(user._id).map(card => (
                        <div
                          key={card._id}
                          className="relative bg-gradient-to-br from-[#232336] to-[#2d2d44] rounded-xl shadow-lg p-5 flex flex-col md:flex-row items-center gap-4 min-w-[320px] transition-all animate-fade-in"
                        >
                          {/* Card Brand & Chip */}
                          <div className="flex flex-col items-start flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="bg-yellow-300 w-8 h-5 rounded-sm flex items-center justify-center">
                                <svg width="20" height="12"><rect width="20" height="12" rx="2" fill="#e2c044"/></svg>
                              </span>
                              <span className="text-xs text-gray-400">{card.bankName}</span>
                            </div>
                            <div className="text-lg font-bold text-white mb-1">{card.cardName}</div>
                            <div className="text-xs text-gray-400 mb-2">•••• XXXX</div>
                            <span className={`text-xs px-2 py-1 rounded-full ${card.outstandingAmount === 0 ? 'bg-green-700 text-green-200' : 'bg-red-700 text-red-200'}`}>
                              {card.outstandingAmount === 0 ? 'Paid' : 'Unpaid'}
                            </span>
                          </div>
                          {/* Card Details */}
                          <div className="flex flex-col gap-1 text-right min-w-[120px]">
                            <div className="text-xs text-gray-400">Limit</div>
                            <div className="font-semibold text-white">₹{card.cardLimit.toLocaleString()}</div>
                            <div className="text-xs text-gray-400 mt-2">Outstanding</div>
                            <div className="font-semibold text-white">₹{card.outstandingAmount.toLocaleString()}</div>
                            <div className="text-xs text-gray-400 mt-2">Billing</div>
                            <div className="font-semibold text-white">{new Date(card.billingDate).toLocaleDateString()}</div>
                          </div>
                          {/* Actions */}
                          <div className="absolute top-3 right-3 flex gap-2">
                            <Button size="icon" variant="ghost" onClick={() => setEditingCard(card)}>
                              <Pencil className="w-4 h-4 text-blue-400" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => deleteCard(card._id)}>
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      {/* Card Edit Modal (unchanged) */}
      {editingCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#252536] rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Card</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Card Name</label>
                <input 
                  type="text" 
                  value={editingCard.cardName}
                  onChange={(e) => setEditingCard({...editingCard, cardName: e.target.value})}
                  className="w-full bg-[#1c1c28] border border-gray-700 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Bank Name</label>
                <input 
                  type="text" 
                  value={editingCard.bankName}
                  onChange={(e) => setEditingCard({...editingCard, bankName: e.target.value})}
                  className="w-full bg-[#1c1c28] border border-gray-700 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Card Limit</label>
                <input 
                  type="number" 
                  value={editingCard.cardLimit}
                  onChange={(e) => setEditingCard({...editingCard, cardLimit: Number(e.target.value)})}
                  className="w-full bg-[#1c1c28] border border-gray-700 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Outstanding Amount</label>
                <input 
                  type="number" 
                  value={editingCard.outstandingAmount}
                  onChange={(e) => setEditingCard({...editingCard, outstandingAmount: Number(e.target.value)})}
                  className="w-full bg-[#1c1c28] border border-gray-700 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Billing Date</label>
                <input 
                  type="date" 
                  value={new Date(editingCard.billingDate).toISOString().split('T')[0]}
                  onChange={(e) => setEditingCard({...editingCard, billingDate: e.target.value})}
                  className="w-full bg-[#1c1c28] border border-gray-700 rounded px-3 py-2"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button 
                  onClick={() => setEditingCard(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => updateCard(editingCard._id, editingCard)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
