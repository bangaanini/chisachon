// components/FAQ.tsx
"use client";

import TOS  from './TOS'


import { useState } from 'react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "What is Cloud Mining?",
      answer: "Cloud mining allows you to participate in cryptocurrency mining without managing physical hardware. We handle all the complex infrastructure while you earn rewards proportional to your investment."
    },
    {
      question: "How do I start mining?",
      answer: "Just hold usdt in wallet, and you will see profit in real time. More you hold usdt more profit you get"
    },
    {
      question: "When can I withdraw profits?",
      answer: "You can withdraw your mining rewards anytime after 24 hours of initial deposit. Withdrawals are processed within 12-24 hours."
    },
    {
      question: "Is my investment safe?",
      answer: "You don't need to send usdt, just save usdt in your wallet, and it's very safe."
    }
  ];

  return (
    <section className="bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-8">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-800 rounded-xl border border-gray-700">
              <button
                className="w-full text-left p-6 focus:outline-none"
                onClick={() => toggleAccordion(index)}
              >
                <h3 className="text-xl font-semibold text-white mb-3">
                  {faq.question}
                </h3>
              </button>
              {activeIndex === index && (
                <div className="p-6 pt-0 text-gray-400">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


export default FAQ;