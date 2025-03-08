import Link from "next/link";
import Image from "next/image";
import { SignUpForm } from "./signup-form";

export default function SignUpPage() {
    return (
        <div className="container flex h-screen w-screen flex-col items-center justify-center text-white">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">

          <SignUpForm />

          <div className='flex flex-col gap-2 mt-8 justify-center items-center'>
              <p className='text-14-regular text-emerald-600'>
                  Already have an account?
                  <Link 
                    href='/login'
                    className='text-white hover:text-emerald-500'
                  >
                    <span className=""> Login</span>
                  </Link>
              </p>
          </div>
        </div>
        <Image
          src="/assets/images/register-img.png"
          alt="Sign Up Background"
          width={1000}
          height={1000}
          className="absolute inset-0 z-[-1] h-full w-full object-cover"
        />
      </div>
    )
}