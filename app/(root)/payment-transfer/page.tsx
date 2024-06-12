import HeaderBox from "@/components/HeaderBox";
import PaymentTransferForm from "@/components/PaymentTransferForm";
import { getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import React from "react";

const Transfer = async () => {
  const loggedIn = await getLoggedInUser();

  // get data for many accounts
  const accounts = await getAccounts({
    userId: loggedIn.$id,
  });

  // if we dont get accounts, it will exit out of the function and not return the homepage
  if (!accounts) return;

  const accountsData = accounts?.data;

  return (
    <section className="payment-transfer">
      <HeaderBox
        title="Payment Transfer"
        subtext="Please provide specific details related to the payment transfer"
      />

      <section className="size-full pt-5">
        {/* pass our accounts since it contain data for all of our banks so we can choose from which bank we want to transfer the money from */}
        <PaymentTransferForm accounts={accountsData} />
      </section>
    </section>
  );
};

export default Transfer;
