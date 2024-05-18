"use client";
// we used "use client" because the CountUp package uses hooks

import CountUp from "react-countup";

const AnimatedCounter = ({ amount }: { amount: number }) => {
  return (
    <div className="w-full">
      <CountUp decimals={2} decimal="." prefix="$" end={amount} />
      {/* CountUp is used for the counting effect */}
      {/* end tu maksudnya kat mana counter tu berakhir,in this case counter tu stop at the amount of balance that we have */}
    </div>
  );
};

export default AnimatedCounter;
