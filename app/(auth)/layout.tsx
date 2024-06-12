import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen w-full justify-between font-inter">
      {children}

      <div className="auth-asset">
        <div>
          <h2 className="text-xl ml-[400px] font-bold mb-7 justify-center items-center">
            Banking, Digitized for You.
          </h2>
          <Image
            src="/icons/financify-auth.png"
            alt="Auth image"
            width={900}
            height={900}
            className="ml-[400px]"
          />
        </div>
      </div>
    </main>
  );
}
