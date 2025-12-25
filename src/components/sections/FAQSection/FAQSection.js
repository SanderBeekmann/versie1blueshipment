import React, { useState } from 'react';
import './FAQSection.css';

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="faq-icon">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Helper function to format answer text - first sentence as lead (semibold), rest normal
const formatAnswer = (text) => {
  // Split by sentence endings
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim());
  
  if (sentences.length === 1) {
    // If only one sentence, try to split it intelligently at a natural break point
    const sentence = sentences[0].trim();
    // Look for a comma or other natural break point in the middle
    const words = sentence.split(' ');
    if (words.length > 12) {
      // Find a comma or period in the middle portion
      const midPoint = Math.floor(words.length * 0.45);
      let breakPoint = midPoint;
      
      // Try to find a comma near the midpoint
      for (let i = midPoint; i < Math.min(midPoint + 5, words.length - 1); i++) {
        if (words[i].includes(',')) {
          breakPoint = i + 1;
          break;
        }
      }
      
      const firstPart = words.slice(0, breakPoint).join(' ');
      const secondPart = words.slice(breakPoint).join(' ');
      return { lead: firstPart, rest: secondPart };
    }
    // If sentence is short, just make first few words bold
    if (words.length > 6) {
      const firstPart = words.slice(0, Math.ceil(words.length * 0.4)).join(' ');
      const secondPart = words.slice(Math.ceil(words.length * 0.4)).join(' ');
      return { lead: firstPart, rest: secondPart };
    }
    return { lead: sentence, rest: null };
  }
  
  // Multiple sentences: first sentence is lead
  return { lead: sentences[0].trim(), rest: sentences.slice(1).join(' ') };
};

function FAQSection({ faqs: customFaqs }) {
  const [openIndex, setOpenIndex] = useState(-1);

  const defaultFaqs = [
    {
      question: 'Hoe snel verzenden jullie?',
      answer: 'Orders die binnenkomen worden dezelfde dag ingepakt en verzonden. Geen wachten, geen gedoe. Je klanten krijgen hun pakket snel en jij krijgt goede reviews.'
    },
    {
      question: 'Hoe worden mijn pakketten verzonden?',
      answer: 'Voor Nederlandse zendingen maken wij gebruik van DHL, voor Belgische zendingen gebruiken wij Bpost.'
    },
    {
      question: 'Wat gebeurt er met retouren?',
      answer: 'Retouren worden door ons verwerkt en je ontvangt een volledige rapportage. We handelen alles af zodat jij je op nieuwe orders kunt concentreren. Dat kost je slechts €1,50 per retour.'
    },
    {
      question: 'Zijn er opslagkosten?',
      answer: 'Nee. Je voorraad staat veilig bij ons zonder aparte opslagkosten. Je betaalt alleen voor wat je verzend. Dat scheelt je honderden euro\'s per maand vergeleken met andere fulfilmentcentra.'
    },
    {
      question: 'Hoe werkt de listing-software?',
      answer: 'Je kunt gratis productlijsten bij ons afnemen die klaar zijn voor gebruik. Geen gedoe met handmatig invoeren. Alles is al ingesteld en je kunt direct beginnen met verkopen.'
    },
    {
      question: 'Hoe bereik ik jullie als ik vragen heb?',
      answer: 'Via WhatsApp. We reageren binnen dertig minuten op je bericht. Geen wachtrijen, geen e-mails die verdwijnen. Je spreekt ons rechtstreeks en krijgt antwoord als je ons nodig hebt.'
    }
  ];

  const faqs = customFaqs || defaultFaqs;

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  const handleKeyDown = (event, index) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleFAQ(index);
    }
  };

  return (
    <section className="faq-section">
      <div className="faq-container">
        <div className="faq-content">
          <div className="faq-header">
            <h2 className="faq-title" data-animate-title>Vragen</h2>
            <p className="faq-description">
              Alles wat je wilt weten over hoe we werken en wat we voor je kunnen doen.
            </p>
            <p className="faq-cta-text">Staat je vraag er niet tussen?</p>
            <button className="btn btn-whatsapp">WhatsApp</button>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const { lead, rest } = formatAnswer(faq.answer);
              
              return (
                <div 
                  key={index} 
                  className={`faq-item ${isOpen ? 'open' : ''}`}
                >
                  <button 
                    className="faq-question"
                    onClick={() => toggleFAQ(index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span>{faq.question}</span>
                    <PlusIcon />
                  </button>
                  <div 
                    className="faq-answer"
                    id={`faq-answer-${index}`}
                    aria-hidden={!isOpen}
                  >
                    <p>
                      <span className="faq-answer-lead">{lead}</span>
                      {rest && <span className="faq-answer-rest"> {rest}</span>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;

