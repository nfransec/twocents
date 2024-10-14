// import Link from 'next/link';
// import { LoginForm } from './login-form';

// export default function LoginPage() {
//     return (
//         <div className='container flex h-screen w-screen flex-col items-center justify-center'>
//             <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]'>
//                 <div className='flex flex-col space-y-2 text-center'>
//                     <h1 className='text-2xl font-semibold tracking-tight'>
//                         Welcome back
//                     </h1>
//                     <p className='text-sm text-muted-foreground'>
//                         Enter your email to sign in to your account
//                     </p>
//                 </div>
//                 <LoginForm />
//                 <p className="px-8 text-center text-sm text-muted-foreground">
//           <Link
//             href="/signup"
//             className="hover:text-brand underline underline-offset-4"
//           >
//             Don&apos;t have an account? Sign Up
//           </Link>
//         </p>
//             </div>
//         </div>
//     )
// }


import Link from 'next/link';
import { LoginForm } from './login-form';

export default function LoginPage() {
    return (
        <div className='flex h-screen w-screen items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500'>
            <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] bg-white rounded-lg shadow-lg p-8'>
                <div className='flex flex-col space-y-2 text-center'>
                    <h1 className='text-2xl font-semibold tracking-tight text-gray-800'>
                        Welcome back
                    </h1>
                    <p className='text-sm text-gray-600'>
                        Enter your email to sign in to your account
                    </p>
                </div>
                <LoginForm />
                <p className="px-8 text-center text-sm text-gray-600">
                    <Link
                        href="/signup"
                        className="hover:text-blue-600 underline underline-offset-4"
                    >
                        Don&apos;t have an account? Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}
