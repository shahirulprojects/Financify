"use client";
import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Footer from "./Footer";
import PlaidLink from "./PlaidLink";

const Sidebar = ({ user }: SidebarProps) => {
  const pathname = usePathname(); // to know at which url or which path are we at
  return (
    <section className="sidebar">
      <nav className="flex flex-col gap-4">
        <Link href="/" className="mb-12 cursor-pointer items-center gap-2 flex">
          <Image
            src="/icons/logo.svg"
            width={34}
            height={34}
            alt="Financify logo"
            className="size-[50px] max-xl:size-14"
          />
          <h1 className="sidebar-logo">Financify</h1>
        </Link>
        {sidebarLinks.map((item) => {
          const isActive =
            pathname === item.route || pathname.startsWith(`${item.route}/`); // check if the current path or url matches the item.route. Yang second tu cam nak check whether it is cam home/question1 ke ha camtu
          return (
            <Link
              href={item.route}
              key={item.label}
              className={cn("sidebar-link", { "bg-bank-gradient": isActive })}
            >
              {/* cn is a function from the lib utils file and we are passing two parameter as a style to it which is sidebar-link and bg-bank-gradient. The bg-bank-gradient style will only be applied if the pathname is active */}
              <div className="relative size-6">
                <Image
                  src={item.imgURL}
                  alt={item.label}
                  fill
                  className={cn({ "brightness-[3] invert-0": isActive })}
                  // the fill property is particularly useful for creating responsive images that automatically adjust to the size of their parent containers.
                  // adjust the brightness and invert the colours if isActive is true
                />
              </div>
              <p className={cn("sidebar-label", { "!text-white": isActive })}>
                {item.label}
              </p>
            </Link>
          );
        })}
        <PlaidLink user={user} />
      </nav>
      <Footer user={user} />
    </section>
  );
};

export default Sidebar;
