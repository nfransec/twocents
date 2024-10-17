
import React from 'react'
import { 
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage 
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Control } from 'react-hook-form'
import { FormFieldType } from './forms/UserForm'
import Image from 'next/image'
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input';
import E164Number from 'react-phone-number-input';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Select, SelectContent, SelectValue } from './ui/select'
import { SelectTrigger } from '@radix-ui/react-select'

type E164Number = string;

interface CustomProps {
    control: Control<any>,
    fieldType: FormFieldType,
    name: string,
    label?: string, 
    placeholder?: string,
    iconSrc?: string,
    iconAlt?: string,
    disabled?: boolean,
    dateFormat?: string,
    showTimeSelect?: boolean,
    children?: React.ReactNode,
    renderSkeleton?: (field: any) => React.ReactNode,

}

const RenderField = ({ field, props }: { field: any; props: CustomProps }) => {
    switch (props.fieldType) {
        case FormFieldType.INPUT:
            return (
                <div className='flex rounded-md border border-dark-500 bg-dark-400'>
                    {props.iconSrc && (
                        <Image 
                            src={props.iconSrc}
                            height={24}
                            width={24}
                            alt={props.iconAlt || 'icon'}
                            className='ml-2'
                        />
                    )}
                    <FormControl>
                        <Input 
                            placeholder={props.placeholder}
                            {...field}
                            className='shad-input border-0 ml-2 text-white'
                        />
                    </FormControl>
                </div>
            );
        case FormFieldType.PHONE_INPUT:
            return (
                <FormControl>
                    <PhoneInput 
                        defaultCountry="IN"
                        placeholder={props.placeholder}
                        international
                        withCountryCallingCode
                        value={field.value as E164Number | undefined}
                        onChange={field.onChange}
                        className="input-phone text-white"
                    />
                </FormControl>
            );
        case FormFieldType.DATE_PICKER:
            return (
                <div className='flex rounded-md border border-dark-500 bg-dark-400'>
                    <Image 
                        src='/assets/icons/calendar.svg'
                        height={24}
                        width={24}
                        alt='calendar'
                        className='ml-2'
                    />
                    <FormControl className='ml-2'>
                        <DatePicker 
                            selected={field.value} 
                            onChange={(date) => field.onChange(date)}
                            dateFormat={props.dateFormat ?? 
                                'dd/MM/yyyy'
                            }
                            showTimeSelect={props.showTimeSelect ?? false}
                            timeInputLabel='Time:'
                            wrapperClassName='date-picker'
                        />
                    </FormControl>
                </div>
            )
        case FormFieldType.SKELETON:
            return props.renderSkeleton ? props.renderSkeleton(field) : null
        case FormFieldType.SELECT:
            return (
                <div className='flex rounded-md border border-dark-500 bg-dark-400 w-fit'>
                    <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="shad-select-trigger">
                                    <SelectValue placeholder={props.placeholder} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent className="shad-select-content">
                                {props.children}
                            </SelectContent>
                        </Select>
                    </FormControl>
                </div>
            );
        default:
            break;
    }
}

const CustomFormField = (props: CustomProps) => {
    
    const { control, fieldType, name, label } = props;

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className='flex-1 text-white'>
                    {fieldType !== FormFieldType.CHECKBOX && label && (
                        <FormLabel>{label}</FormLabel>
                    )}

                    <RenderField field={field} props={props} />

                    <FormMessage className='shad-error' />
                </FormItem>
            )}
        />
    )
}

export default CustomFormField
