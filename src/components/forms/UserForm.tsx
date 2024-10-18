"use client";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { 
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
 } from '@/components/ui/form'
 import { Input } from "@/components/ui/input"
 import { Button } from "@/components/ui/button"
import CustomFormField from "@/components/CustomFormField"
import SubmitButton from "../SubmitButton"
import { useState } from "react"
import { UserFormValidation } from "@/lib/validation"
import { useRouter } from "next/navigation"
import { createUser } from "@/lib/actions/user.actions"

export enum FormFieldType {
    INPUT = 'input',
    TEXTAREA = 'textarea',
    PHONE_INPUT = 'phoneInput',
    CHECKBOX = 'checkbox',
    DATE_PICKER = 'datePicker',
    SELECT = 'select',
    SKELETON = 'skeleton',
    PASSWORD_INPUT = 'passwordInput',

}


const UserForm = () => {

    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof UserFormValidation>>({
        resolver: zodResolver(UserFormValidation),
        defaultValues: {
        name: "",
        email: "",
        phone: "",
        },
    })

    const onSubmit = async (values: z.infer<typeof UserFormValidation>) => {
        setIsLoading(true);

        try {
            const user = { 
                name: values.name,
                email: values.email,
                phone: values.phone,
            };
            
            const newUser = await createUser(user);

            if(newUser) {
                router.push(`/users/${newUser.$id}/register`);
            }

        } catch (error) {
            console.log(error)
        }

        setIsLoading(false);
    } 

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
                <section className="mb-12 space-y-4">
                    <h1 className="header text-white">Hi there 👋</h1>
                    <p className="text-dark-700">Get started with your account.</p>
                </section>

                <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="name"
                label="Full name"
                placeholder="John Doe"
                iconSrc="/assets/icons/user.svg"
                iconAlt="user"
                />

                <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="email"
                label="Email"
                placeholder="johndoe@gmail.com"
                iconSrc="/assets/icons/email.svg"
                iconAlt="email"
                />

                <CustomFormField
                fieldType={FormFieldType.PHONE_INPUT}
                control={form.control}
                name="phone"
                label="Phone number"
                placeholder="(555) 123-4567"
                />

                <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
            </form>
        </Form>
    ) 
}

export default UserForm;