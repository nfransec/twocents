'use client'
import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/api/users/me')
      setUser(response.data.data)
    } catch (error) {
      toast.error("Failed to fetch user data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      await axios.put('/api/users/update', user)
      toast.success("Profile updated successfully")
    } catch (error) {
      toast.error("Failed to update profile")
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const passwords = Object.fromEntries(formData)

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    try {
      await axios.put('/api/users/change-password', passwords)
      toast.success("Password changed successfully")
      e.target.reset()
    } catch (error) {
      
      toast.error("Failed to change password")
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your account&#39;s profile information and email address.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={user.fullName}
                  onChange={(e) => setUser({...user, fullName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser({...user, email: e.target.value})}
                />
              </div>
              <Button type="submit">Save</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" name="currentPassword" type="password" />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" name="newPassword" type="password" />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" />
              </div>
              <Button type="submit">Change Password</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}