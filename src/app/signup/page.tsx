'use client';
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";

export default function SignUpPage() {
    const router = useRouter();
    const [user, setUser] = useState({
        email: "",
        password: "",
        username: "",
    })
    const [buttonDisabled, setButtonDisabled] = useState(false)
    const [loading, setLoading] = useState(false)

    const onSignup = async () => {
        // sign-up button logic - frontend
        try {
            
            setLoading(true);
            await axios.post('/api/users/signup', user);

            router.push('/login');

        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
                console.log('Sign up failed:', error.message);
            } else {
                toast.error('An unknown error occurred');
                console.log('Sign up failed: An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }

    }

    useEffect(() => {
        if (user.email.length > 0 && user.password.length > 0 && user.username.length > 0) {
            setButtonDisabled(false);
        } else {
            setButtonDisabled(true)
        }
    }, [user]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-red-600">
            <div className="w-full max-w-md p-8 space-y-6 bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-lg border border-white/30">
                <h1 className="text-2xl font-semibold text-center text-white">{loading ? 'Processing' : 'Create an Account'}</h1>
                <hr className="mb-6 border-white/50" />

                <div className="space-y-4">
                    <input 
                        className="w-full p-3 mt-1 bg-white bg-opacity-20 text-white placeholder-gray-200 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        type="text" 
                        id="username" 
                        value={user.username} 
                        onChange={(e) => setUser({...user, username: e.target.value})} 
                        placeholder="Username"
                    />

                    <input 
                        className="w-full p-3 mt-1 bg-white bg-opacity-20 text-white placeholder-gray-200 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        type="email" 
                        id="email" 
                        value={user.email} 
                        onChange={(e) => setUser({...user, email: e.target.value})} 
                        placeholder="Email"
                    />

                    <input 
                        className="w-full p-3 mt-1 bg-white bg-opacity-20 text-white placeholder-gray-200 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        type="password" 
                        id="password" 
                        value={user.password} 
                        onChange={(e) => setUser({...user, password: e.target.value})} 
                        placeholder="Password"
                    />
                </div>

                <button
                    onClick={onSignup}
                    className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                >
                    {buttonDisabled ? "Complete the form" : "Sign Up"}
                </button>

                <p className="text-center text-white">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-200 hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    )
}