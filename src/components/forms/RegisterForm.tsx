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
import { FormFieldType } from "./UserForm";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Cards, GenderOptions } from "../../../constants";
import { Label } from "../ui/label";
import { SelectItem } from "../ui/select";
import Image from "next/image";


const RegisterForm = ({ user }: {user: User}) => {

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
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-12">
                <section className="space-y-4">
                    <h1 className="header text-white">Welcome 👋</h1>
                    <p className="text-dark-700">Let us know more about yourself.</p>
                </section>

                <section className="space-y-6">
                    <div className="mb-9 space-y-1">
                        <h2 className="sub-header text-white">Personal Information</h2>
                    </div>
                </section>

                <CustomFormField
                fieldType={FormFieldType.INPUT}
                control={form.control}
                name="name"
                label='Full Name'
                placeholder="John Doe"
                iconSrc="/assets/icons/user.svg"
                iconAlt="user"
                />

                <div className="flex flex-col gap-6 lg:flex-row">
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
                </div>

                <div className="flex flex-col gap-6 lg:flex-row">
                    <CustomFormField
                        fieldType={FormFieldType.DATE_PICKER}
                        control={form.control}
                        name="birthDate"
                        label="Date of Birth"
                    />

                    <CustomFormField
                        fieldType={FormFieldType.SKELETON}
                        control={form.control}
                        name="gender"
                        label="Gender"
                        renderSkeleton={(field) => (
                            <FormControl>
                                <RadioGroup className="flex h-11 gap-6 lg:justify-between" onValueChange={field.onChange} defaultValue={field.value}>
                                    {GenderOptions.map((option) => (
                                        <div key={option} className="radio-group">
                                            <RadioGroupItem value={option} id={option} />
                                            <Label htmlFor={option} className="cursor-pointer">
                                                {option}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        )}
                    />
                </div>

                <div className="flex flex-col gap-6 lg:flex-row">
                    <CustomFormField
                        fieldType={FormFieldType.INPUT}
                        control={form.control}
                        name="address"
                        label='Address'
                        placeholder="14th Street, New York"

                    />

                    <CustomFormField
                        fieldType={FormFieldType.INPUT}
                        control={form.control}
                        name="occupation"
                        label='Occupation'
                        placeholder="Software Engineer"
                    />
                </div>

                <section className="space-y-6">
                    <div className="mb-9 space-y-1">
                        <h2 className="sub-header text-white">Card details</h2>
                    </div>

                    <CustomFormField
                        fieldType={FormFieldType.SELECT}
                        control={form.control}
                        name="primaryCard"
                        label='Primary Card'
                        placeholder="Select your card"
                    >
                        {Cards.map((card, i) => (
                            <SelectItem key={card.name + i} value={card.name}>
                                <div className="flex cursor-pointer items-center gap-2">
                                    <Image
                                        src={card.image}
                                        width={32}
                                        height={32}
                                        alt='card'
                                        className='rounded-full border border-dark-500'
                                    />
                                    <p>{card.name}</p>
                                </div>
                            </SelectItem>
                        ))}
                    </CustomFormField>
                </section>

                

                <SubmitButton isLoading={isLoading}>Get Started</SubmitButton>
            </form>
        </Form>
    ) 
}

export default RegisterForm;