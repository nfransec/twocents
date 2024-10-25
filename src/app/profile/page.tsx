'use client'

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Bell, CreditCard, FileText, HelpCircle, Home, LogOut, User } from "lucide-react"
import CustomSidebar from "@/components/customSidebar"
import CustomFormField from "@/components/CustomFormField"
import { FormFieldType } from "@/components/forms/UserForm"
import BottomNavigation from "@/components/BottomNavigation"
import FileUploader from "@/components/FileUploader"
import { UserFormDefaultValues } from "../../../constants"



export interface UserType {
  _id: string
  fullName: string
  email: string
  phoneNumber: string
  username: string
  profilePicture: string
}


const userFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  phoneNumber: z.string().min(10, { message: "Please enter a valid phone number." }).optional(),
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
  bankStatement: z.custom<File[]>().optional(),
  privacyConsent: z
    .boolean()
    .default(false)
    .refine((value) => value === true, { message: 'You must agree to the privacy policy to proceed.'}),
  acknowledgementConsent: z
    .boolean()
    .default(false)
    .refine((value) => value === true, { message: 'You must agree to the acknowledgement policy to proceed.'}),
});

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<UserType | null>(null)


  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      ...UserFormDefaultValues,
      fullName: "",
      email: "",
      username: "",
      phoneNumber: "",
    },
  })

  const getUserDetails = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await axios.get('/api/users/me')
      const userData = res.data.data
      setUser(userData)
      userForm.reset({
        fullName: userData?.fullName ?? "",
        email: userData?.email ?? "",
        //phoneNumber: userData?.phoneNumber ?? "",
        username: userData?.username ?? "",
        privacyConsent: false,
        acknowledgementConsent: false,
      })
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }, [userForm])


  useEffect(() => {
    getUserDetails()
  }, [getUserDetails])

  const onSubmitUserForm = async (values: z.infer<typeof userFormSchema>) => {
    setIsLoading(true)
    try {
      await axios.put('/api/users/update', values)
      toast.success("Profile updated successfully")
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.')
        router.push('/login')
      } else if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        toast.error('An unknown error occurred')
      }
    } else {
      toast.error('An unknown error occurred')
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await axios.get('/api/users/logout')
      toast.success('Logout successful')
      router.push('/login')
    } catch (error) {
      handleError(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen text-white pb-16 md:pb-0">
      <div className="flex-1 overflow-auto px-4 md:px-6 lg:px-8">
        {/* <header className="shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-white mt-4">{user?.fullName?.split(' ')[0]}&#39;s dashboard</h1>
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-gray-400 mr-4" />
              <div className="flex items-center">
                <Image
                  src={user?.profilePicture || "/assets/icons/user2.svg"}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full mr-2"
                />
                <span className="text-sm font-medium text-white">Hello, <span className="font-bold text-green-500">{user?.fullName?.split(' ')[0]}</span></span>
              </div>
            </div>
          </div>
        </header> */}

        <main className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="sm:px-0">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Card */}
              <Card className="flex-1 border-green-500">
                <CardHeader>
                  {/* <CardTitle>My profile <span className='text-green-300'> | </span> {user?.fullName.split(' ')[0]}</CardTitle> */}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center mb-6">
                    <Image
                      src={user?.profilePicture || "/assets/icons/user2.svg"}
                      alt="Profile"
                      width={200}
                      height={200}
                      className="rounded-full mb-4"
                    />
                  </div>
                  <Form {...userForm}>
                    <form onSubmit={userForm.handleSubmit(onSubmitUserForm)} className="space-y-4">

                      <CustomFormField
                          fieldType={FormFieldType.INPUT}
                          control={userForm.control}
                          name="fullName"
                          placeholder="John Doe"
                          iconSrc="/assets/icons/user.svg"
                          iconAlt="user"
                      />

                      <CustomFormField
                        fieldType={FormFieldType.INPUT}
                        control={userForm.control}
                        name="username"
                        placeholder="johndoe"
                        iconSrc="/assets/icons/username.svg"
                        iconAlt="user"
                        description="This is your unique username on the platform."
                      />

                      <CustomFormField
                          fieldType={FormFieldType.INPUT}
                          control={userForm.control}
                          name="email"
                          placeholder="johndoe@gmail.com"
                          iconSrc="/assets/icons/email2.svg"
                          iconAlt="email"
                      />
        
                      {/* <CustomFormField
                          fieldType={FormFieldType.PHONE_INPUT}
                          control={userForm.control}
                          name="phoneNumber"
                          placeholder="(555) 123-4567"
                      /> */}
                    
                      
                      <div className="mt-10">
                        <CustomFormField
                          fieldType={FormFieldType.SKELETON}
                          control={userForm.control}
                          name='bankStatement'
                          label='Upload Your Bank Statement'
                          renderSkeleton={(field) => (
                            <FormControl>
                              <FileUploader files={field.value} onChange={field.onChange} />
                            </FormControl>
                          )}
                        />

                        <section className='mt-4 space-y-6'>
                          <div className='mb-9 space-y-1 flex flex-col gap-4'>
                            <h2 className='text-14-bold'>Consent and Privacy</h2>
                            <CustomFormField
                              fieldType={FormFieldType.CHECKBOX}
                              control={userForm.control}
                              name='privacyConsent'
                              label='I agree to the terms and conditions and consent to the processing of my personal data in accordance with the Privacy Policy.'
                            />

                            <CustomFormField 
                              fieldType={FormFieldType.CHECKBOX}
                              control={userForm.control}
                              name='acknowledgementConsent'
                              label='I acknowledge that I have read and understood the above consent and privacy policy.'
                            />
                          </div>
                        </section>

                        <div className="flex flex-row space-x-4 mt-6 justify-between">
                          <Button type="submit" className="w-full bg-green-500" disabled={isLoading}>
                            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                            Save and Continue
                          </Button>
                          {/* <Button
                            type="button"
                            className="w-full bg-red-500 text-white"
                            onClick={logout}
                            disabled={isLoading}
                          >
                            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                            Logout
                          </Button> */}
                        </div>

                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
