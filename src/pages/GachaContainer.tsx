import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { toast } from "react-toastify";
import { supabase } from '../../lib/supabase';
import Image from "next/image";

type Prize = {
  id: number;
  name: string;
  description: string;
  image: string;
  probability: number;
};

const prizes: Prize[] = [
  { id: 1, name: "Gold Coin", description: "You won 10 Gold Coins!", image: "/images/gold_coin.png", probability: 0.05 },
  { id: 2, name: "Silver Coin", description: "You won 50 Silver Coins!", image: "/images/silver_coin.png", probability: 0.10 },
  { id: 3, name: "Bronze Coin", description: "You won 100 Bronze Coins!", image: "/images/bronze_coin.png", probability: 0.15 },
  { id: 4, name: "Small Prize", description: "You got a small prize!", image: "/images/small_prize.png", probability: 0.20 },
  { id: 5, name: "Medium Prize", description: "You got a medium prize!", image: "/images/medium_prize.png", probability: 0.15 },
  { id: 6, name: "Large Prize", description: "You got a large prize!", image: "/images/large_prize.png", probability: 0.10 },
  { id: 7, name: "Bonus Prize", description: "You got a bonus prize!", image: "/images/bonus_prize.png", probability: 0.05 },
  { id: 8, name: "Lucky Prize", description: "You got a lucky prize!", image: "/images/lucky_prize.png", probability: 0.05 },
  { id: 9, name: "Mystery Box", description: "You got a mystery box!", image: "/images/mystery_box.png", probability: 0.10 },
  { id: 10, name: "Jackpot", description: "Congratulations! You hit the jackpot!", image: "/images/jackpot.png", probability: 0.05 },
];

const totalProbability = prizes.reduce((sum, prize) => sum + prize.probability, 0);

const GachaContainer = () => {
  const { address } = useAccount();
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fungsi untuk memutar animasi gacha
  const rollGacha = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }
    setIsRolling(true);

    // Animasi pemutaran gacha selama 3 detik
    let rollTime = 3000;
    let interval = 100; // Kecepatan animasi awal
    let elapsedTime = 0;

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % prizes.length);
      elapsedTime += interval;
      if (elapsedTime >= rollTime) {
        clearInterval(intervalId);
        
        // Pilih hadiah berdasarkan probabilitas
        const rand = Math.random() * totalProbability;
        let cumulative = 0;
        let prize: Prize | null = null;
        for (let i = 0; i < prizes.length; i++) {
          cumulative += prizes[i].probability;
          if (rand <= cumulative) {
            prize = prizes[i];
            break;
          }
        }
        
        setSelectedPrize(prize);
        toast.success(`Congratulations! You won ${prize?.name}`);

        // Update database
        

        setIsRolling(false);
      }
    }, interval);
  };

  return (
    <section className="max-w-3xl mx-auto my-12 p-6 bg-gray-900 rounded-xl shadow-xl">
      <h2 className="text-3xl font-bold text-center text-white mb-4">Gacha Event</h2>
      
      {/* Gacha Carousel */}
      <div className="relative w-full flex justify-center overflow-hidden p-4 bg-gray-800 rounded-lg">
        <div className="flex gap-4 transition-transform ease-out duration-300" style={{ transform: `translateX(-${currentIndex * 120}px)` }}>
          {prizes.map((prize, index) => (
            <div key={index} className={`w-24 h-24 p-2 rounded-md ${index === currentIndex ? 'border-4 border-yellow-400 scale-110' : 'opacity-50'}`}>
              <Image src={prize.image} alt={prize.name} width={80} height={80} />
            </div>
          ))}
        </div>
      </div>

      {/* Display Hadiah */}
      {selectedPrize ? (
        <div className="p-4 bg-gradient-to-br from-purple-700 to-blue-700 rounded-lg text-white text-center mt-6">
          <h3 className="text-2xl font-bold mb-2">{selectedPrize.name}</h3>
          <Image src={selectedPrize.image} alt={selectedPrize.name} width={100} height={100} className="mx-auto" />
          <p className="mb-2">{selectedPrize.description}</p>
          <button
            onClick={() => setSelectedPrize(null)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="w-full text-center mt-6">
          <button
            onClick={rollGacha}
            disabled={isRolling}
            className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRolling ? "Rolling..." : "Start Gacha"}
          </button>
        </div>
      )}
    </section>
  );
};

export default GachaContainer;
