import UserForm from "@/components/forms/UserForm";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex h-screen max-h-screen">
      
      {/* TODO: OTP Verification | PassKeyModal */}

      <section className="remove-scrollbar container my-auto">
        <div className="sub-container max-w-[496px]">
          <Image 
            src='/assets/icons/logo-full.svg'
            height={1000}
            width={1000}
            alt='TwoCents'
            className="mb-12 h-10 w-fit"
          />
          
          <UserForm />

          <div className="text-14-regular mt-20 flex justify-between">
            <p className="justify-items-end text-dark-600 xl:text-left">© 2024 TwoCent</p>
            <Link href='/?admin=true' className="text-green-500">
              Admin
            </Link>
          </div>
        </div>
      </section>
      <Image 
        src='/assets/images/register-img.png'
        height={1000}
        width={1000}
        alt='TwoCent'
        className="side-img max-w-[50%]"
      />
    </div>
  )
} 