// Flow:
// 1.Create a link token
// 2.Pass generated linktoken to PlaidLink
// 3.Trigger flow of connecting bank account to application through PlaidLink
// 4.On success,PlaidLink will provide temporary public token
// 5.Exchange public token with permanent access token
// 6.Exchange access token to get bank account information
// 7.Processor(in this case we use Dwolla). Dwolla is a payment processor that we use to process our money through Plaid

import React, { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  PlaidLinkOnSuccess,
  PlaidLinkOptions,
  usePlaidLink,
} from "react-plaid-link";
import { useRouter } from "next/navigation";
import {
  createLinkToken,
  exchangePublicToken,
} from "@/lib/actions/user.actions";
import Image from "next/image";

// if the variant is not being passed, we will use the default style for the button
const PlaidLink = ({ user, variant }: PlaidLinkProps) => {
  const router = useRouter();

  // useState so that it can help us get access to that token
  const [token, setToken] = useState("");

  // useEffect so that we can fetch the token on time
  useEffect(() => {
    const getLinkToken = async () => {
      // connect our existing user to a plaid user through a token
      const data = await createLinkToken(user);
      setToken(data?.linkToken);
    };
    getLinkToken();
  }, [user]);

  // assigned the onSuccess to the type PlaidLinkOnSuccess
  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    async (public_token: string) => {
      // exchange the public token which will allow us to exchange the existing access token for a token that allows us to do a lot of different banking stuffs
      await exchangePublicToken({
        publicToken: public_token,
        user,
      });

      // after we exchange the public token, we want to push to the homepage as as sign that we successfully link our bank account
      router.push("/");
    },
    [user] // will recall the useCallback function everytime the user changes
  );

  // config object of a type PlaidLinkOptions
  const config: PlaidLinkOptions = {
    token,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  return (
    <>
      {variant === "primary" ? (
        <Button
          onClick={() => open()} // this is a form of a callback function by the way
          disabled={!ready}
          className="plaidlink-primary"
        >
          Connect Bank
        </Button>
      ) : variant === "ghost" ? (
        <Button
          onClick={() => open()}
          variant="ghost"
          className="plaidlink-ghost"
        >
          <Image
            src="/icons/connect-bank.svg"
            alt="coonnect bank"
            width={24}
            height={24}
          />
          {/* will be hidden usually but will show on extra large device */}
          <p className="hidden text-[16px] font-semibold text-black-2 xl:block">
            Connect Bank
          </p>
        </Button>
      ) : (
        <Button onClick={() => open()} className="plaidlink-default">
          <Image
            src="/icons/connect-bank.svg"
            alt="coonnect bank"
            width={24}
            height={24}
          />
          <p className="text-[16px] font-semibold text-black-2">Connect Bank</p>
        </Button>
      )}
    </>
  );
};

export default PlaidLink;
