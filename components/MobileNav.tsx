"use client";
import React from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import Link from "next/link";
import { sidebarLinks } from "@/constants";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const MobileNav = ({ user }: MobileNavProps) => {
  const pathname = usePathname();
  return (
    <section className="w-full max-w-[264px]">
      <Sheet>
        <SheetTrigger>
          <Image
            src="/icons/hamburger.svg"
            width={30}
            height={30}
            alt="menu"
            className="cursor-pointer"
          />
        </SheetTrigger>
        <SheetContent side="left" className="border-none bg-white">
          {/* side means that at which side will the sidebar pops up */}
          <Link
            href="/"
            className="cursor-pointer items-center gap-1 px-4 flex"
          >
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
          <div className="mobilenav-sheet">
            <SheetClose asChild>
              {/* SheetClose allows us to close the sidebar if we click somewhere else or after we click the icon of the section that we want to go*/}
              {/* asChild means that it is the child of the sheet */}
              <nav className="flex h-full flex-col gap-6 pt-16 text-white">
                {sidebarLinks.map((item) => {
                  const isActive =
                    pathname === item.route ||
                    pathname.startsWith(`${item.route}/`); // check if the current path or url matches the item.route. Yang second tu cam nak check whether it is cam home/question1 ke ha camtu
                  return (
                    <SheetClose asChild key={item.route}>
                      <Link
                        href={item.route}
                        key={item.label}
                        className={cn("mobilenav-sheet_close w-full", {
                          "bg-bank-gradient": isActive,
                        })}
                      >
                        {/* cn is a function from the lib utils file and we are passing two parameter as a style to it which are mobilenav-sheet_close w-full and bg-bank-gradient. The bg-bank-gradient style will only be applied if the pathname is active */}

                        <Image
                          src={item.imgURL}
                          alt={item.label}
                          width={20}
                          height={20}
                          className={cn({
                            "brightness-[3] invert-0": isActive,
                          })}
                          // adjust the brightness and invert the colours if isActive is true
                        />

                        <p
                          className={cn("text-16 font-semibold text-black-2", {
                            "text-white": isActive,
                          })}
                        >
                          {item.label}
                        </p>
                      </Link>
                    </SheetClose>
                  );
                })}
                USER
              </nav>
            </SheetClose>
            FOOTER
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default MobileNav;
