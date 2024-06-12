import HeaderBox from "@/components/HeaderBox";
import TransactionsTable from "@/components/TransactionsTable";
import { getAccount, getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { formatAmount } from "@/lib/utils";
import React from "react";

// from the searchParams, we can further destructure the id and the page
const TransactionHistory = async ({
  searchParams: { id, page },
}: SearchParamProps) => {
  // convert the page into a number as it is actually a string or set 1 by default
  const currentPage = Number(page as string) || 1;
  const loggedIn = await getLoggedInUser();

  // get data for many accounts
  const accounts = await getAccounts({
    userId: loggedIn.$id,
  });

  // if we dont get accounts, it will exit out of the function and not return the homepage
  if (!accounts) return;

  const accountsData = accounts?.data;
  const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId;

  // after we get the data for multiple accounts, we want to get data for an account. itemId refers to the account id (database>collection>document>item)
  const account = await getAccount({ appwriteItemId });

  return (
    <div className="transactions">
      <div className="transactions-header">
        <HeaderBox
          title="Transaction History"
          subtext="See your bank details and transactions"
        />
      </div>

      <div className="space-y-6">
        <div className="transactions-account">
          <div className="flex flex-col gap-2">
            {/* to know which account to display (checkings,savings,etc) */}
            <h2 className="text-18 font-bold text-white">
              {account?.data.name}
            </h2>
            <p className="text-14 text-blue-25">
              {/* display the full name of the bank account */}
              {account?.data.officialName}
            </p>
            <p className="text-14 font-semibold tracking-[1.1px] text-white">
              ●●●● ●●●● ●●●● {account?.data.mask}
              {/* mask is the last 4 numbers of the account */}
            </p>
          </div>

          <div className="transactions-account-balance">
            <p className="text-14">Current Balance</p>
            <p className="text-24 text-center font-bold">
              {formatAmount(account?.data.currentBalance)}
            </p>
          </div>
        </div>

        <section className="flex w-full flex-col gap-6">
          <TransactionsTable transactions={account?.transactions} />
        </section>
      </div>
    </div>
  );
};

export default TransactionHistory;
