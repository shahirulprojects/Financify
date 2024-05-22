"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const AuthForm = ({ type }: { type: string }) => {
  const [user, setUser] = useState(null); // at the start the user data wil be null
  return (
    <section className="auth-form">
      <header className="flex flex-col gap-5 md:gap-8">
        <Link href="/" className="cursor-pointer items-center gap-1 flex">
          <Image
            src="/icons/logo.svg"
            width={34}
            height={34}
            alt="Financify logo"
          />
          <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">
            Financify
          </h1>
        </Link>

        {/* to see if the user data already exists / user already signed up */}
        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
            {/* if the user exists,link account.Else sign in or else sign up */}
            {user ? "Link Account" : type === "sign-in" ? "Sign In" : "Sign Up"}

            <p className="text-16 font-normal text-gray-600">
              {user
                ? "Link your account to get started"
                : "Please enter your details"}
            </p>
          </h1>
        </div>
      </header>
      {user ? (
        <div className="flex flex-col gap-4">
          {/* PlaidLink to link our bank accounts */}
        </div>
      ) : (
        <>FORM</>
      )}
    </section>
  );
};

export default AuthForm;
