import { useState } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { toast } from 'react-toastify';

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET; // Pastikan sudah di-set di .env
const USDT_CONTRACT = process.env.NEXT_PUBLIC_USDT_ADDRESS; // Kontrak USDT ERC20

const EventContainer = () => {
  const { address } = useAccount();
  const [sliderValue, setSliderValue] = useState(500); // Minimum $500
  const [txProcessing, setTxProcessing] = useState(false);
  const { data: txHash, sendTransactionAsync } = useSendTransaction();
  const { isLoading: txConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  // Hitung estimasi profit 20%
  const estimatedProfit = sliderValue * 0.2;

  // Fungsi untuk Join Event (kirim USDT dari wallet user ke wallet admin)
  const handleJoinEvent = async () => {
    if (!address || !ADMIN_WALLET) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (sliderValue < 500) {
      toast.error("Minimum deposit is $500");
      return;
    }
    try {
      setTxProcessing(true);
      // Konversi nilai deposit ke smallest unit USDT (6 desimal)
      const usdtAmount = parseUnits(sliderValue.toString(), 6);

      // Mengirim transaksi ke kontrak USDT dengan memanggil fungsi transfer(address,uint256)
      // Data transaksi di-encode menggunakan fungsi transfer (method id: 0xa9059cbb)
      const tx = await sendTransactionAsync({
        to: USDT_CONTRACT as `0x${string}`,
        data: `0xa9059cbb${ADMIN_WALLET.replace('0x', '').padStart(64, '0')}${usdtAmount.toString(16).padStart(64, '0')}`,
      });
      toast.info("Transaction submitted. Please confirm in your wallet.");
      // Tunggu transaksi selesai
      // (Anda juga bisa menggunakan useWaitForTransactionReceipt untuk update status secara realtime)
    } catch (error) {
      console.error("Join Event error:", error);
      toast.error("Transaction failed.");
    } finally {
      setTxProcessing(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto my-12 p-6 bg-gray-900 rounded-xl shadow-xl">
      <h2 className="text-3xl font-bold text-center text-white mb-4">Join Event</h2>
      <p className="text-center text-gray-300 mb-6">
        Deposit minimum $500 to join event.
      </p>
      <div className="px-6 py-4 bg-gradient-to-br from-blue-800 to-purple-800 rounded-lg mb-6">
        <label htmlFor="depositSlider" className="block text-gray-200 mb-2">
          Select Deposit Amount ($)
        </label>
        <input
          id="depositSlider"
          type="range"
          min={500}
          max={5000}
          step={50}
          value={sliderValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-gray-300 mt-2">
          <span>${sliderValue}</span>
          <span>Est. Profit: ${estimatedProfit.toFixed(2)}</span>
        </div>
      </div>
      <button
        onClick={handleJoinEvent}
        disabled={txProcessing || txConfirming}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {(txProcessing || txConfirming) ? "Processing..." : "Join Event"}
      </button>
    </section>
  );
};

export default EventContainer;
