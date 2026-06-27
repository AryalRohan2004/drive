import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import './FAQ.css';

const faqs = [
  {
    question: "How much do the lessons cost?",
    answer: (
      <p>
        Individual lessons are $140 per hour. When you book a package, lessons are discounted to $126 per hour — that's $14 off every lesson. Your first lesson is just $99, which includes a full driving assessment and your personalised P-Plate Roadmap.
      </p>
    )
  },
  {
    question: "How many lessons do I need?",
    answer: (
      <>
        <p>It depends on your current experience:</p>
        <ul className="faq-list-items">
          <li>Can already drive and have basic car control: around 6 hours of professional instruction</li>
          <li>Complete beginner or very nervous behind the wheel: around 12 hours</li>
          <li>International licence conversion with solid driving experience: around 6 hours</li>
        </ul>
        <p>
          Your first lesson includes a full skills assessment where your instructor evaluates your level and recommends exactly how many lessons you'll need — so you never pay for lessons you don't need.
        </p>
      </>
    )
  },
  {
    question: "Do the lessons count towards my logbook?",
    answer: (
      <p>
        Yes! All lesson hours with our instructors count toward your required supervised logbook hours. You'll still need to complete the total 75 hours required (including 15 night hours), but our professional lessons cover a solid portion of those hours and help you build the right skills faster.
      </p>
    )
  },
  {
    question: "Can I change instructors if I'm not happy?",
    answer: (
      <p>
        Yes! Our Love-Your-Instructor Guarantee means you can switch instructors for free if you're not satisfied. We have multiple vetted instructors to ensure you find the right match for your learning style.
      </p>
    )
  },
  {
    question: "Do you serve in my area?",
    answer: (
      <p>
        We service all Adelaide metropolitan areas — northern, southern, eastern, and western suburbs plus the CBD. Your instructor is matched based on your location to keep things convenient. If you're unsure whether we cover your area, <Link to="/contact" className="faq-link">contact us</Link> and we'll confirm.
      </p>
    )
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleOpen = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page bg-light">
      <div className="container section">
        <h1 className="h1 text-center faq-title">Frequently Asked Questions</h1>
        <div className="faq-list">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <div className="faq-question" onClick={() => toggleOpen(index)}>
                  <h3>{faq.question}</h3>
                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                {isOpen && (
                  <div className="faq-answer">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
