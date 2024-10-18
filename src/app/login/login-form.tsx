'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import axios from "axios"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/ui/icons"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import CustomFormField from "@/components/CustomFormField"
import { FormFieldType } from "@/components/forms/UserForm"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long.",
  }),
})

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      await axios.post('/api/users/login', values)
      toast.success("Login successful")
      router.push('/profile')
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.error)
      } else {
        toast.error('An unknown error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
            <section className="mb-12 space-y-4">
              <h1 className="header text-white text-center">Welcome back 🙏</h1>
              <p className="text-dark-700 text-center">Enter your email and secret to login.</p>
            </section>
            
            <CustomFormField
              fieldType={FormFieldType.INPUT}
              control={form.control}
              name="email"
              label="Email"
              placeholder="johndoe@gmail.com"
              iconSrc="/assets/icons/email2.svg"
              iconAlt="email"
            />

            <CustomFormField
              fieldType={FormFieldType.PASSWORD_INPUT}
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              iconSrc="/assets/icons/lock.svg"
              iconAlt="password"
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
            
            <Button type="submit" className="w-full bg-green-500 text-white" disabled={isLoading}>
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In
            </Button>
          </form>
        </Form>
  )
}