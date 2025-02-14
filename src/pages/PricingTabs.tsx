import { useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { supabase } from '../../lib/supabase';
import { parseUnits } from 'viem';
import { toast } from 'react-toastify';

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET;
const USDT_CONTRACT = process.env.NEXT_PUBLIC_USDT_ADDRESS;



const PricingTabs = () => {
  const [activeTab, setActiveTab] = useState<'basic' | 'pro'>('basic');
  // State untuk menyimpan data paket yang dipilih
  const [pendingPlanData, setPendingPlanData] = useState<{
    plan: 'basic' | 'pro';
    depositAmount: number;
  } | null>(null);
  const { address } = useAccount();
  const { data: hash, sendTransactionAsync, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const handleJoinMining = async (plan: 'basic' | 'pro') => {
    if (!address || !ADMIN_WALLET) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const usdAmount = plan === 'basic' ? 50 : 100;
      const usdtAmount = parseUnits(usdAmount.toString(), 6);
      

      // Kirim transaksi langsung
      const txHash = await sendTransactionAsync({
        to: USDT_CONTRACT as `0x${string}`, // Kirim ke kontrak USDT
        data: `0xa9059cbb${ADMIN_WALLET.replace('0x', '').padStart(64, '0')}${usdtAmount.toString(16).padStart(64, '0')}` // transfer(address,uint256)
      });

      // Jika transaksi berhasil (mendapatkan hash), simpan data paket untuk update DB nanti
      if (txHash) {
        setPendingPlanData({ plan, depositAmount: usdAmount });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(
        'Transaction failed: ' +
          (error instanceof Error ? error.message : 'Unknown error')
      );
    }
  };

  // Notifikasi status transaksi (hanya untuk info proses wallet)
  useEffect(() => {
    if (isPending) {
      toast.info('Waiting for wallet confirmation...');
    } else if (isConfirming) {
      toast.info('Processing transaction...');
    }
  }, [isPending, isConfirming]);

  // Update database setelah transaksi dikonfirmasi
  useEffect(() => {
    const updateDatabase = async () => {
      if (isConfirmed && pendingPlanData && address) {
        try {
          const { plan, depositAmount } = pendingPlanData;
  
          // 1. Ambil nilai deposit saat ini dari database
          const { data, error: fetchError } = await supabase
            .from('users')
            .select('deposit_amount')
            .eq('wallet_address', address)
            .single();
  
          if (fetchError && fetchError.code !== 'PGRST116') {
            // Jika terjadi error selain "tidak ditemukan", hentikan proses
            console.error('Supabase fetch error:', fetchError);
            toast.error('Failed to fetch existing deposit: ' + (fetchError.message || 'Unknown error'));
            return;
          }
  
          // 2. Tambahkan deposit baru ke nilai yang ada (jika tidak ada, gunakan 0)
          const currentDeposit = data ? data.deposit_amount || 0 : 0;
          const newDepositAmount = currentDeposit + depositAmount;
  
          // 3. Perbarui data di database dengan jumlah total deposit
          const { error: updateError } = await supabase
            .from('users')
            .upsert(
              {
                wallet_address: address,
                plan: plan,
                deposit_amount: newDepositAmount,
                last_updated: new Date().toISOString()
              },
              { onConflict: 'wallet_address' }
            );
  
          if (updateError) {
            console.error('Supabase update error:', updateError);
            toast.error('Database update failed: ' + (updateError.message || 'Unknown error'));
          } else {
            toast.success(`Transaction confirmed! New deposit amount: $${newDepositAmount}`);
          }
        } catch (error) {
          console.error('Error updating database:', error);
          toast.error('Database update failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
          // Reset pendingPlanData agar update tidak dilakukan berulang kali
          setPendingPlanData(null);
        }
      }
    };
  
    updateDatabase();
  }, [isConfirmed, pendingPlanData, address]);
  

  return (
    <section className="max-w-4xl mx-auto my-12 p-6 bg-gray-900 rounded-xl shadow-2xl shadow-[0_0_20px_-5px_rgba(96,165,250,0.3)]">
      <h2 className="text-3xl text-white font-bold text-center mb-8">MINING PLAN</h2>

      <div className="flex border-b border-gray-700 justify-center gap-4">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-8 py-4 text-lg font-medium rounded-lg transition-all duration-300 ${
            activeTab === 'basic'
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
          }`}
        >
          Basic
        </button>
        <button
          onClick={() => setActiveTab('pro')}
          className={`px-8 py-4 text-lg font-medium rounded-lg transition-all duration-300 ${
            activeTab === 'pro'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
          }`}
        >
          Pro
        </button>
      </div>

      <div className="pt-8 space-y-6">
        {activeTab === 'basic' && (
          <div className="p-6 border border-gray-700 rounded-xl bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-sm transform transition-all hover:scale-[1.02] hover:shadow-xl">
            <div className="text-center">
              <span className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                $50
              </span>
              <p className="text-white text-sm">
                Basic cloud mining package with an initial investment of $50. Earn passive income from cryptocurrency mining with an estimated income of 8 - 12%.
              </p>
              <div className="mt-4 space-y-3">
                {[
                  ['Duration:', '1 month'],
                  ['Participants:', '1,297'],
                  ['Total Investment:', '$92,000.00'],
                  ['Total Profit:', '$196,200.00']
                ].map(([label, value], index) => (
                  <div
                    key={index}
                    className="flex justify-between p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-gray-700"
                  >
                    <span className="text-gray-300">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleJoinMining('basic')}
                disabled={isPending || isConfirming}
                className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(isPending || isConfirming) ? 'Processing...' : 'Join Mining'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'pro' && (
          <div className="p-6 border border-gray-700 rounded-xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm transform transition-all hover:scale-[1.02] hover:shadow-xl">
            <div className="text-center">
              <span className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                $100
              </span>
              <p className="text-white text-sm">
                Pro cloud mining package with an initial investment of $100. Earn passive income from cryptocurrency mining with an estimated income of 15 - 20%.
              </p>
              <div className="mt-4 space-y-3">
                {[
                  ['Duration:', '1 month'],
                  ['Participants:', '3,270'],
                  ['Total Investment:', '$582,200.00'],
                  ['Total Profit:', '$2,164,400.00']
                ].map(([label, value], index) => (
                  <div
                    key={index}
                    className="flex justify-between p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-gray-700"
                  >
                    <span className="text-gray-300">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleJoinMining('pro')}
                disabled={isPending || isConfirming}
                className="mt-6 w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(isPending || isConfirming) ? 'Processing...' : 'Join Mining'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingTabs;
