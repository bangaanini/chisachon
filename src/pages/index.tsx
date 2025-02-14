import { ConnectButton } from '@rainbow-me/rainbowkit';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import PricingTabs from './PricingTabs';
import Hero from './HeroSection';
import Header from './Header';
import Wallet from './Wallet';


const Home: NextPage = () => {
  return (
    <div className={styles.container} bg-gray-900>
      <Head>
        <title>Chisachon Cloud Mining</title>
        <meta
          content="Chisachon Cloud Mining"
          name="Join Cloud Mining Now and Earn Big"
        />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <Header />  

      <Hero />
      <Wallet />
      <PricingTabs /> 
      <main className={styles.main}>
      <div className="p-6 border border-gray-700 rounded-xl bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-sm transform transition-all hover:scale-[1.02] hover:shadow-xl">
  <div className="text-center">
    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
      Latest Transactions
    </h3>
    
    <div className="space-y-4">
      {/* Transaction Item 1 */}
      <div className="relative flex justify-between items-center p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-gray-700 hover:bg-gray-800/50 transition-colors">
        <div className="flex-1 text-left">
          <p className="text-gray-300">Deposit to Basic Plan</p>
          <p className="text-sm text-gray-400">2024-03-15 14:30:45</p>
        </div>
        <span className="text-green-400 font-medium">+$50.00</span>
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l"></div>
      </div>

      {/* Transaction Item 2 */}
      <div className="relative flex justify-between items-center p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-gray-700 hover:bg-gray-800/50 transition-colors">
        <div className="flex-1 text-left">
          <p className="text-gray-300">Withdrawal Request</p>
          <p className="text-sm text-gray-400">2024-03-14 09:15:22</p>
        </div>
        <span className="text-red-400 font-medium">-$30.00</span>
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-l"></div>
      </div>

      {/* Transaction Item 3 */}
      <div className="relative flex justify-between items-center p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-gray-700 hover:bg-gray-800/50 transition-colors">
        <div className="flex-1 text-left">
          <p className="text-gray-300">Plan Upgrade to Pro</p>
          <p className="text-sm text-gray-400">2024-03-13 16:45:01</p>
        </div>
        <span className="text-green-400 font-medium">+$100.00</span>
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500 rounded-l"></div>
      </div>
    </div>

    {/* View All Button */}
    <button className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg">
      View All Transactions
    </button>
  </div>
</div>
      </main> 
    </div>
  );
};

export default Home;
