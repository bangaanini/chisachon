// components/FAQ.tsx
"use client";

import TOS  from './TOS'


const FAQ = () => {
  return (
    <section className="bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-8">
          Frequently Asked Questions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* FAQ Item 1 */}
          <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-3">
              What is Cloud Mining?
            </h3>
            <p className="text-gray-400">
              Cloud mining allows you to participate in cryptocurrency mining without 
              managing physical hardware. We handle all the complex infrastructure while 
              you earn rewards proportional to your investment.
            </p>
          </div>

          {/* FAQ Item 2 */}
          <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-3">
              How do I start mining?
            </h3>
            <p className="text-gray-400">
              Simply choose a mining plan, deposit USDT, and watch your rewards grow. 
              Our system automatically allocates mining power based on your investment.
            </p>
          </div>

          {/* FAQ Item 3 */}
          <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-3">
              When can I withdraw profits?
            </h3>
            <p className="text-gray-400">
              You can withdraw your mining rewards anytime after 24 hours of initial 
              deposit. Withdrawals are processed within 12-24 hours.
            </p>
          </div>

          {/* FAQ Item 4 */}
          <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-3">
              Is my investment safe?
            </h3>
            <p className="text-gray-400">
              We use enterprise-grade security measures including cold storage for funds 
              and smart contract audits. However, always remember cryptocurrency 
              investments carry inherent risks.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};


export default FAQ;