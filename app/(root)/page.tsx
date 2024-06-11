import HeaderBox from "@/components/HeaderBox";
import RightSidebar from "@/components/RightSidebar";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import { getAccount, getAccounts } from "@/lib/actions/bank.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";

// from the searchParams, we can further destructure the id and the page
const Home = async ({ searchParams: { id, page } }: SearchParamProps) => {
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
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || "Guest"}
            subtext="Access and manage your account and transactions efficiently."
          />

          <TotalBalanceBox
            accounts={accountsData} // number of accounts that we have
            totalBanks={accounts?.totalBanks} // number of banks that we have
            totalCurrentBalance={accounts?.totalCurrentBalance} // total current balance that we have
          />
        </header>
        RECENT TRANSACTIONS
      </div>
      <RightSidebar
        user={loggedIn}
        transactions={accounts?.transactions}
        banks={accountsData?.slice(0, 2)} // show the first two bank cards
      />
    </section>
  );
};

export default Home;
