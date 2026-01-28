import React from 'react';
import { useParams, Link } from 'react-router-dom';
import './BlogDetailPage.css';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/layout/Footer/Footer';
import SEO from '../../components/SEO/SEO';
import { openWhatsApp } from '../../utils/whatsapp';

// Blog posts data - in de toekomst kan dit uit een CMS of API komen
const blogPosts = {
  'van-dropshipping-naar-voorraad-fulfilment': {
    title: "Van dropshipping naar voorraad",
    subtitle: "Waarom fulfilment dé volgende stap is voor bol.com verkopers",
    metaTitle: "Van dropshipping naar voorraad verkopen op bol.com | Fulfilment gids",
    metaDescription: "Dropshipper op bol.com? Ontdek waarom verkoop vanuit voorraad via fulfilment de slimme overstap is voor groei, betrouwbaarheid en hogere ranking.",
    date: "2025-01-15",
    readTime: "8 min",
    slug: "van-dropshipping-naar-voorraad-fulfilment",
    content: [
      {
        type: "paragraph",
        text: "Veel bol.com verkopers zijn begonnen met dropshipping. Het is laagdrempelig, snel te starten en vereist geen grote investering in voorraad. Maar naarmate je shop groeit, loop je tegen steeds dezelfde problemen aan: lange levertijden, beperkte controle en toenemende druk vanuit bol.com."
      },
      {
        type: "paragraph",
        text: "Steeds meer dropshippers maken daarom de overstap naar verkoop vanuit eigen voorraad. Fulfilment speelt daarin een cruciale rol. In dit artikel lees je waarom bol.com afstand neemt van dropshipping, wat verkoop vanuit voorraad oplevert en hoe fulfilment je helpt om die overstap soepel en schaalbaar te maken."
      },
      {
        type: "cta-inline",
        text: "Overweeg je om te stoppen met dropshipping en wil je weten of verkoop vanuit voorraad voor jouw situatie haalbaar is? Dan is het verstandig om eerst inzicht te krijgen in je logistieke opties.",
        linkText: "Bekijk hoe fulfilment werkt voor bol.com verkopers",
        linkUrl: "/diensten#fulfilment"
      },
      {
        type: "heading",
        level: 3,
        text: "Waarom dropshipping steeds minder werkt op bol.com"
      },
      {
        type: "paragraph",
        text: "Dropshipping lijkt aantrekkelijk, maar sluit steeds minder goed aan bij de eisen van bol.com en de verwachtingen van klanten."
      },
      {
        type: "paragraph",
        text: "Bol.com stuurt sterk op leverbetrouwbaarheid, klanttevredenheid en controle over het logistieke proces. Verkopers moeten hun producten op voorraad hebben en zelf verantwoordelijk zijn voor verzending en retouren. Modellen waarbij producten rechtstreeks via externe leveranciers worden verstuurd, zorgen vaak voor vertragingen, fouten en onduidelijkheid."
      },
      {
        type: "paragraph",
        text: "Daarom zie je dat bol.com kritischer is geworden op dropshippers. Accounts worden strenger beoordeeld op levertijden, retourafhandeling en communicatie. Wie structureel niet voldoet, loopt risico op beperkingen of zelfs sluiting van het account."
      },
      {
        type: "paragraph",
        text: "Voor veel dropshippers is dit het moment om hun businessmodel te heroverwegen."
      },
      {
        type: "cta-block",
        title: "Twijfel je of dropshipping nog toekomst heeft op bol.com?",
        text: "Veel verkopers merken dat levertijden, klachten en accountbeperkingen toenemen. Met fulfilment verkoop je vanuit eigen voorraad, voldoe je aan de eisen van bol.com en bouw je aan een stabiele business.",
        buttonText: "Ontdek hoe fulfilment jouw overstap makkelijker maakt",
        buttonType: "primary",
        buttonUrl: "/diensten#fulfilment"
      },
      {
        type: "heading",
        level: 3,
        text: "Verkoop vanuit voorraad: de logische volgende stap"
      },
      {
        type: "paragraph",
        text: "Verkoop vanuit eigen voorraad geeft je direct meer controle. Je bepaalt zelf waar je voorraad ligt, hoe snel je levert en hoe retouren worden afgehandeld."
      },
      {
        type: "paragraph",
        text: "Dit heeft meerdere voordelen. Levertijden worden korter en betrouwbaarder, wat direct bijdraagt aan hogere klanttevredenheid en betere reviews. Daarnaast sluit dit model beter aan bij de eisen van bol.com, wat een positief effect kan hebben op je zichtbaarheid en prestaties op het platform."
      },
      {
        type: "paragraph",
        text: "Voor veel voormalige dropshippers voelt voorraad houden spannend, maar in de praktijk blijkt het juist rust te geven. Je weet precies wat je verkoopt, wat je marges zijn en wat je klanten kunnen verwachten."
      },
      {
        type: "heading",
        level: 3,
        text: "Wat is fulfilment en waarom is het ideaal voor ex-dropshippers?"
      },
      {
        type: "paragraph",
        text: "Fulfilment is het uitbesteden van je logistiek aan een gespecialiseerd fulfilmentcenter. Je houdt zelf voorraad aan, maar hoeft geen magazijn te beheren of pakketten te versturen."
      },
      {
        type: "paragraph",
        text: "Voor ex-dropshippers is fulfilment ideaal omdat je geen eigen opslagruimte nodig hebt, processen volledig geautomatiseerd zijn, verzendingen snel en professioneel verlopen, retouren worden afgehandeld zonder extra werk, en je kunt opschalen zonder extra personeel."
      },
      {
        type: "paragraph",
        text: "Je combineert hiermee de controle van voorraadverkoop met het gemak dat je gewend was bij dropshipping."
      },
      {
        type: "paragraph",
        text: "Steeds meer voormalige dropshippers kiezen daarom voor een fulfilmentpartner die de logistiek volledig uit handen neemt, terwijl zij zelf controle houden over voorraad en marges."
      },
      {
        type: "cta-context",
        linkText: "Lees hoe professionele fulfilment voor bol.com werkt",
        linkUrl: "/diensten#fulfilment"
      },
      {
        type: "heading",
        level: 3,
        text: "Fulfilment versus dropshipping in de praktijk"
      },
      {
        type: "paragraph",
        text: "Bij dropshipping ben je afhankelijk van externe leveranciers. Levertijden zijn vaak onvoorspelbaar en fouten liggen buiten je controle. Dit leidt tot klachten, retouren en lagere beoordelingen."
      },
      {
        type: "paragraph",
        text: "Fulfilment werkt precies andersom. Je voorraad ligt klaar in een magazijn, orders worden automatisch verwerkt en verzendingen gaan vaak dezelfde dag nog de deur uit. Klanten ontvangen hun bestelling snel en betrouwbaar, wat vertrouwen opbouwt en herhaalaankopen stimuleert."
      },
      {
        type: "paragraph",
        text: "Voor bol.com verkopers die willen groeien, is dit verschil doorslaggevend."
      },
      {
        type: "heading",
        level: 3,
        text: "Hoe werkt de overstap van dropshipping naar fulfilment?"
      },
      {
        type: "paragraph",
        text: "De overstap hoeft niet ingewikkeld te zijn."
      },
      {
        type: "paragraph",
        text: "Je begint met het selecteren van producten die goed verkopen en geschikt zijn voor voorraad. Deze voorraad lever je aan bij een fulfilmentcenter. Vervolgens koppel je je bol.com account, zodat bestellingen automatisch worden doorgestuurd."
      },
      {
        type: "paragraph",
        text: "Vanaf dat moment loopt het logistieke proces volledig via het fulfilmentcenter. Jij behoudt inzicht via dashboards en rapportages, terwijl je klanten profiteren van snelle levering en professionele service."
      },
      {
        type: "paragraph",
        text: "Veel verkopers maken deze overstap gefaseerd, zodat risico's beperkt blijven."
      },
      {
        type: "heading",
        level: 3,
        text: "Wat kost fulfilment voor voormalige dropshippers?"
      },
      {
        type: "paragraph",
        text: "Fulfilmentkosten bestaan meestal uit een vaste prijs per verzending, retourkosten per retourzending, opslagkosten voor je voorraad, en optionele extra services."
      },
      {
        type: "paragraph",
        text: "Hoewel dit anders voelt dan dropshipping, blijkt fulfilment in de praktijk vaak winstgevender. Minder retouren, betere reviews en hogere conversie zorgen ervoor dat de totale opbrengst stijgt."
      },
      {
        type: "paragraph",
        text: "Belangrijk is dat je kiest voor een fulfilmentpartner met transparante prijzen en duidelijke afspraken."
      },
      {
        type: "heading",
        level: 3,
        text: "Wanneer is dit het juiste moment om te switchen?"
      },
      {
        type: "paragraph",
        text: "De overstap van dropshipping naar fulfilment is logisch wanneer je verkoop stabiel is, je regelmatig klachten krijgt over levertijden, je bol.com prestaties onder druk staan, je wilt opschalen zonder meer stress, en je business toekomstbestendig wilt maken."
      },
      {
        type: "paragraph",
        text: "Voor veel verkopers is dit het moment waarop hun onderneming echt professioneel wordt."
      },
      {
        type: "cta-primary",
        title: "Klaar om de overstap te maken van dropshipping naar voorraad?",
        text: "Fulfilment helpt je om sneller te leveren, betrouwbaarder te worden en zonder extra stress te groeien op bol.com. Ontdek of dit model past bij jouw producten en volumes.",
        primaryButtonText: "Plan een vrijblijvend gesprek",
        primaryButtonType: "whatsapp",
        secondaryButtonText: "Bekijk onze fulfilmentoplossing",
        secondaryButtonUrl: "/diensten#fulfilment"
      },
      {
        type: "heading",
        level: 3,
        text: "Conclusie"
      },
      {
        type: "paragraph",
        text: "Dropshipping is vaak een goede start, maar geen eindstation. Voor bol.com verkopers die willen groeien, controle willen terugpakken en willen voldoen aan de eisen van het platform, is verkoop vanuit voorraad via fulfilment de volgende stap."
      },
      {
        type: "paragraph",
        text: "Fulfilment biedt rust, betrouwbaarheid en schaalbaarheid. Precies wat nodig is om van een tijdelijke strategie een duurzaam e-commercebedrijf te maken."
      },
      {
        type: "paragraph",
        text: "Wil je weten of fulfilment voor jouw bol.com shop rendabel is, dan loont het om dit eens door te rekenen of vrijblijvend in gesprek te gaan met een fulfilmentspecialist."
      },
      {
        type: "cta-text",
        linkText: "Neem contact op voor advies over fulfilment",
        linkType: "whatsapp"
      }
    ]
  }
};

function BlogDetailPage() {
  const { slug } = useParams();
  const post = blogPosts[slug];

  const articleSchema = post ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.metaTitle,
    "description": post.metaDescription,
    "author": {
      "@type": "Organization",
      "name": "BlueShipment"
    },
    "publisher": {
      "@type": "Organization",
      "name": "BlueShipment",
      "logo": {
        "@type": "ImageObject",
        "url": "https://blueshipment.nl/logo.png"
      }
    },
    "datePublished": post.date || "2025-01-15",
    "dateModified": post.date || "2025-01-15"
  } : null;

  if (!post) {
    return (
      <div className="app">
        <SEO title="Artikel niet gevonden" />
        <Navbar />
        <main className="page-content blog-detail-page">
          <div className="blog-not-found">
            <h1>Blog niet gevonden</h1>
            <p>De blog die je zoekt bestaat niet.</p>
            <Link to="/resources" className="btn btn-primary">
              Terug naar Resources
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="app">
      {post && (
        <SEO
          title={post.metaTitle}
          description={post.metaDescription}
          type="article"
          structuredData={articleSchema}
        />
      )}
      <Navbar />
      <main className="page-content blog-detail-page">
        <article className="blog-article">
          {/* Breadcrumb */}
          <nav className="blog-breadcrumb">
            <Link to="/resources">Resources</Link>
            <span className="breadcrumb-separator">/</span>
            <span>{post.title}</span>
          </nav>

          {/* Header */}
          <header className="blog-header">
            <h2 className="blog-title">{post.title}</h2>
            {post.subtitle && (
              <p className="blog-subtitle">{post.subtitle}</p>
            )}
            <div className="blog-meta">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span className="meta-separator">•</span>
              <span>{post.readTime} lezen</span>
            </div>
          </header>

          {/* Content */}
          <div className="blog-content">
            {post.content.map((section, index) => {
              if (section.type === 'heading') {
                const HeadingTag = `h${section.level}`;
                return (
                  <HeadingTag key={index} className={`blog-heading blog-heading-${section.level}`}>
                    {section.text}
                  </HeadingTag>
                );
              } else if (section.type === 'paragraph') {
                return (
                  <p key={index} className="blog-paragraph">
                    {section.text}
                  </p>
                );
              } else if (section.type === 'list') {
                return (
                  <ul key={index} className="blog-list">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="blog-list-item">
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              } else if (section.type === 'cta-inline') {
                return (
                  <p key={index} className="blog-paragraph blog-cta-inline">
                    {section.text}{' '}
                    <Link to={section.linkUrl} className="blog-inline-link">
                      {section.linkText}
                    </Link>
                  </p>
                );
              } else if (section.type === 'cta-block') {
                const handleClick = () => {
                  if (section.buttonType === 'whatsapp') {
                    openWhatsApp(`Hallo! Ik heb een vraag over ${section.title}`);
                  }
                };
                
                return (
                  <div key={index} className="blog-cta-block">
                    <h3 className="blog-cta-block-title">{section.title}</h3>
                    <p className="blog-cta-block-text">{section.text}</p>
                    {section.buttonUrl ? (
                      <Link to={section.buttonUrl} className={`btn btn-${section.buttonType || 'primary'}`}>
                        {section.buttonText}
                      </Link>
                    ) : (
                      <button 
                        className={`btn btn-${section.buttonType || 'primary'}`}
                        onClick={handleClick}
                      >
                        {section.buttonText}
                      </button>
                    )}
                  </div>
                );
              } else if (section.type === 'cta-context') {
                return (
                  <p key={index} className="blog-paragraph">
                    <Link to={section.linkUrl} className="blog-context-link">
                      {section.linkText}
                    </Link>
                  </p>
                );
              } else if (section.type === 'cta-primary') {
                const handlePrimaryClick = () => {
                  if (section.primaryButtonType === 'whatsapp') {
                    openWhatsApp(`Hallo! Ik wil graag een vrijblijvend gesprek plannen over fulfilment.`);
                  }
                };
                
                return (
                  <div key={index} className="blog-cta-primary">
                    <h3 className="blog-cta-primary-title">{section.title}</h3>
                    <p className="blog-cta-primary-text">{section.text}</p>
                    <div className="blog-cta-primary-buttons">
                      <button 
                        className={`btn btn-${section.primaryButtonType || 'primary'}`}
                        onClick={handlePrimaryClick}
                      >
                        {section.primaryButtonText}
                      </button>
                      {section.secondaryButtonText && (
                        <Link 
                          to={section.secondaryButtonUrl || '#'} 
                          className="btn btn-outline"
                        >
                          {section.secondaryButtonText}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              } else if (section.type === 'cta-text') {
                const handleTextClick = () => {
                  if (section.linkType === 'whatsapp') {
                    openWhatsApp(`Hallo! Ik wil graag advies over fulfilment voor mijn bol.com shop.`);
                  }
                };
                
                return (
                  <p key={index} className="blog-paragraph">
                    <button 
                      className="blog-text-link"
                      onClick={handleTextClick}
                    >
                      {section.linkText}
                    </button>
                  </p>
                );
              }
              return null;
            })}
          </div>

          {/* Back to Resources */}
          <div className="blog-footer">
            <Link to="/resources" className="blog-back-link">
              ← Terug naar alle resources
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

export default BlogDetailPage;

