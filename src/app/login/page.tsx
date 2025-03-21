import Link from 'next/link';
import { LoginForm } from './login-form';
import Image from 'next/image';


export default function LoginPage() {
    return (
        <div className='flex h-screen max-h-screen'>
            <section className='remove-scrollbar container my-auto'>
                <div className='sub-container max-w-[496px]'>
                    <LoginForm />

                    <div className='flex flex-col gap-2 mt-8 justify-center items-center'>
                        <p className='text-14-regular text-emerald-600'>
                            Don&apos;t have an account? 
                            <Link 
                                href='/signup'
                                className='text-white hover:text-emerald-600'
                            >
                                <span className=''> Sign Up</span>
                            </Link>
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}