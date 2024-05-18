import HeaderBox from "@/components/HeaderBox";
import TotalBalanceBox from "@/components/TotalBalanceBox";

const Home = () => {
  const loggedIn = { firstName: "Shahirul" };
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
            accounts={[]} // number of accounts that we have
            totalBanks={1} // number of banks that we have
            totalCurrentBalance={1250.35} // total current balance that we have
          />
        </header>
      </div>
    </section>
  );
};

export default Home;
