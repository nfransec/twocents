'use client';
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
    const [user, setUser] = useState({
        email: "",
        password: "",
        username: "",
    })

    const onSignup = async () => {
        // sign-up logic
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-red-600">
            <div className="w-full max-w-md p-8 space-y-6 bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-lg border border-white/30">
                <h1 className="text-2xl font-semibold text-center text-white">Create an Account</h1>
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
                    Sign Up
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