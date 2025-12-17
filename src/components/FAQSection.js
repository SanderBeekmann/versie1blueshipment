import React, { useState } from 'react';
import './FAQSection.css';

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
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

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
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
            <button className="btn btn-whatsapp">WhatsApp</button>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${openIndex === index ? 'open' : ''}`}
              >
                <button 
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                >
                  <span>{faq.question}</span>
                  {openIndex === index ? <CloseIcon /> : <PlusIcon />}
                </button>
                {openIndex === index && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;

