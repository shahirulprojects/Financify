import React, { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  PlaidLinkOnSuccess,
  PlaidLinkOptions,
  usePlaidLink,
} from "react-plaid-link";
import { useRouter } from "next/navigation";
import { createLinkToken } from "@/lib/actions/user.actions";

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
    async (public_token: String) => {
      // exchange the public token which will allow us to exchange the existing access token for a token that allows us to do a lot of different banking stuffs
      // await exchangePublicToken({
      //     publicToken:public_token,
      //     user,
      // })

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
        <Button>Connect Bank</Button>
      ) : (
        <Button>Connect Bank</Button>
      )}
    </>
  );
};

export default PlaidLink;
