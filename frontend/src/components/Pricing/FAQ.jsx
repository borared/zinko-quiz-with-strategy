import React from 'react';

const FAQ = () => {
  const faqs = [
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely! No strings attached. You can downgrade to the Free plan at the end of your billing cycle."
    },
    {
      question: "Do you offer teacher discounts?",
      answer: "Our Pro plan is already priced specifically for individual teachers, but we offer bulk discounts for 5+ licenses."
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto mb-24 px-4">
      <h2 className="text-3xl md:text-4xl font-black text-center text-zk-black mb-12 uppercase tracking-tight">
        Common Questions
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white border-[4px] border-zk-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
            <h3 className="text-xl font-bold text-zk-black mb-4">{faq.question}</h3>
            <p className="text-sm font-bold text-zk-black/70 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
