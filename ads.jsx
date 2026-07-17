import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Ads = () => {

    
    const slides = [
      {
        id: 1,
        title: "PRIME",
        description: "gift, status, more possibilities.",
        actionText: "",
        // Сюда вставляй свой SVG код напрямую
        icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="3rem" height="3rem" viewBox="0 0 28 28"><path fill="currentColor" d="M20.75 3a1 1 0 0 1 .78.375l.075.106l4.25 7a1 1 0 0 1-.015 1.063l-.077.102l-11 13a1 1 0 0 1-1.442.088l-.084-.088l-11-13a1 1 0 0 1-.15-1.052l.058-.113l4.25-7a1 1 0 0 1 .725-.473L7.25 3zm-3.235 9h-7.031l3.515 8.672zm5.329 0h-3.171l-2.917 7.195zM8.326 12H5.155l6.087 7.193zm1.348-7H7.811l-3.036 5h3.47zm6.572 0h-4.493l-1.429 5h7.351zm3.942 0h-1.863l1.429 5h3.47z" /></svg>)
      },
      {
        id: 2,
        title: "qwick send",
        description: "fast transaction, low fees.",
        actionText: "",
        icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="3rem" height="3rem" viewBox="0 0 24 24"><g fill="none" fillRule="evenodd"><path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z" /><path fill="currentColor" d="M17.991 6.01L5.399 10.563l4.195 2.428l3.699-3.7a1 1 0 0 1 1.414 1.415l-3.7 3.7l2.43 4.194L17.99 6.01Zm.323-2.244c1.195-.433 2.353.725 1.92 1.92l-5.282 14.605c-.434 1.198-2.07 1.344-2.709.241l-3.217-5.558l-5.558-3.217c-1.103-.639-.957-2.275.241-2.709z" /></g></svg>) // Место под другой SVG
      },
      {
        id: 3,
        title: "referal system",
        description: "get 10% for fees, and more.",
        actionText: "",
        icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="3rem" height="3rem" viewBox="0 0 24 24"><path fill="currentColor" d="M12 11q.825 0 1.413-.588Q14 9.825 14 9t-.587-1.413Q12.825 7 12 7q-.825 0-1.412.587Q10 8.175 10 9q0 .825.588 1.412Q11.175 11 12 11Zm0 2q-1.65 0-2.825-1.175Q8 10.65 8 9q0-1.65 1.175-2.825Q10.35 5 12 5q1.65 0 2.825 1.175Q16 7.35 16 9q0 1.65-1.175 2.825Q13.65 13 12 13Zm0 11q-2.475 0-4.662-.938q-2.188-.937-3.825-2.574Q1.875 18.85.938 16.663Q0 14.475 0 12t.938-4.663q.937-2.187 2.575-3.825Q5.15 1.875 7.338.938Q9.525 0 12 0t4.663.938q2.187.937 3.825 2.574q1.637 1.638 2.574 3.825Q24 9.525 24 12t-.938 4.663q-.937 2.187-2.574 3.825q-1.638 1.637-3.825 2.574Q14.475 24 12 24Zm0-2q1.8 0 3.375-.575T18.25 19.8q-.825-.925-2.425-1.612q-1.6-.688-3.825-.688t-3.825.688q-1.6.687-2.425 1.612q1.3 1.05 2.875 1.625T12 22Zm-7.7-3.6q1.2-1.3 3.225-2.1q2.025-.8 4.475-.8q2.45 0 4.463.8q2.012.8 3.212 2.1q1.1-1.325 1.713-2.95Q22 13.825 22 12q0-2.075-.788-3.887q-.787-1.813-2.15-3.175q-1.362-1.363-3.175-2.151Q14.075 2 12 2q-2.05 0-3.875.787q-1.825.788-3.187 2.151Q3.575 6.3 2.788 8.113Q2 9.925 2 12q0 1.825.6 3.463q.6 1.637 1.7 2.937Z"/></svg>
        ) // Место под третий SVG
      }
    ];
    
    // function BannerCarousel(){
      const [currentIndex, setCurrentIndex] = useState(0);
      const [isVisible, setIsVisible] = useState(true);
    
      useEffect(() => {
        if (!isVisible) return;
        
        // Автоматическое переключение каждые 5 секунд
        const timer = setInterval(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
        }, 5000);
    
        return () => clearInterval(timer);
      }, [isVisible]);
    
      if (!isVisible) return null;

      const pricingRef = useRef(null);

useEffect(() => {
  const container = pricingRef.current;

  if (!container) return;

  const featuredCard = container.querySelector(
    ".ads-price-card-featured"
  );

  if (!featuredCard) return;

  container.scrollLeft =
    featuredCard.offsetLeft -
    container.clientWidth / 2 +
    featuredCard.offsetWidth / 2;
}, []);


  return (
    <div className="AdsContent">
        <main className="ads-page">

      {/* HERO */}
      <section className="ads-hero">
    

        <div className="ads-hero-content">
          <h1>
            Put your brand
            <span >in the wallet.</span>
          </h1>

          <p>
            Reach a growing crypto audience through native placements,
            partnerships and carefully selected campaigns inside xwallet.
          </p>
        </div>

      
      </section>


      {/* BANNERS */}
      <section className="ads-showcase">
        <div className="ads-section-heading">
          <span>01 / placements</span>

          <h2>
            your brand

          </h2>

          <p>
            Place your campaign where users actually interact with the product.
          </p>
        </div>

        <div className="ads-banner-grid">

         
    <div className="carousel-container-ads">
      <div 
        className="carousel-track" 
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide) => (
          <div className="carousel-slide" key={slide.id}>
            <div className="slide-content">
              <div className="text-section">
                <h3>{slide.title}</h3>
                <p>{slide.description}</p>
                <button className="action-button">{slide.actionText}</button>
              </div>
              <div className="icon-section">
                {/* Если SVG нет, рендерим заглушку. Если есть - он отрендерится тут */}
                {slide.icon ? slide.icon : <div className="svg-placeholder">place SVG</div>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* <button className="close-button" onClick={() => setIsVisible(false)}>
        &times;
      </button> */}

      <div className="pagination">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`dot ${currentIndex === index ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>

        </div>
      </section>


      

{/* PRICING */}
<section className="ads-pricing">
  <div className="ads-section-heading">
    <span>03 / pricing</span>

    <h2>
      Choose the
      <br />
      <em>right format.</em>
    </h2>

    <p>
      Simple placements for simple campaigns.
      Choose your format and let's talk.
    </p>
  </div>

  <div className="ads-price-carousel" ref={pricingRef}>

    {/* NATIVE */}
    <article className="ads-price-card">

      <div className="ads-price-top">
        <span className="ads-price-label">starter</span>
        <span className="ads-price-index">01</span>
      </div>

      <h3>Native</h3>

      <div className="ads-price">
        <strong>€25</strong>
        <span>/ 7 days</span>
      </div>

      <p>
        A clean and natural placement inside the xwallet experience.
      </p>

      <ul>
        <li>Native banner placement</li>
        <li>7 days campaign period</li>
        <li>Basic campaign setup</li>
        <li>Standard visibility</li>
      </ul>

      <button>
        request campaign
        <span></span>
      </button>

    </article>

    {/* FEATURED */}
    <article className="ads-price-card ads-price-card-featured">

      <div className="ads-price-top">
        <span className="ads-price-label">most popular</span>
        <span className="ads-price-index">02</span>
      </div>

      <h3>Featured</h3>

      <div className="ads-price">
        <strong>€50</strong>
        <span>/ 7 days</span>
      </div>

      <p>
        The best choice for brands that want to be noticed.
      </p>

      <ul>
        <li>Featured banner placement</li>
        <li>High visibility position</li>
        <li>7 days campaign period</li>
        <li>Campaign setup included</li>
        <li>Direct campaign support</li>
      </ul>

      <button>
        request campaign
        <span></span>
      </button>

    </article>



    {/* PARTNER */}
    <article className="ads-price-card">

      <div className="ads-price-top">
        <span className="ads-price-label">long term</span>
        <span className="ads-price-index">03</span>
      </div>

      <h3>Partner</h3>

      <div className="ads-price">
        <strong>€150</strong>
        <span>/ month</span>
      </div>

      <p>
        A long-term presence for products and projects we believe in.
      </p>

      <ul>
        <li>Dedicated placement</li>
        <li>30 days campaign period</li>
        <li>Priority visibility</li>
        <li>Custom campaign setup</li>
        <li>Partnership support</li>
      </ul>

      <button>
        become a partner
        <span></span>
      </button>

    </article>


    {/* CUSTOM */}
    <article className="ads-price-card">

      <div className="ads-price-top">
        <span className="ads-price-label">custom</span>
        <span className="ads-price-index">04</span>
      </div>

      <h3>Custom</h3>

      <div className="ads-price">
        <strong>Let's talk</strong>
      </div>

      <p>
        Have a different idea? We can build a campaign around your goals.
      </p>

      <ul>
        <li>Custom campaign strategy</li>
        <li>Unique placement</li>
        <li>Long-term cooperation</li>
        <li>Personal campaign support</li>
      </ul>

      <button>
        xwlltlav@gmail.com
        <span></span>
      </button>

    </article>

  </div>

  <div className="ads-carousel-hint">
    <span>←</span>
    <p>swipe to explore</p>
    <span>→</span>
  </div>
</section>

    
      <section className="ads-partnership">
        <div className="ads-partnership-copy">
          <span>03 / placements</span>
         

          <h2>
            Let's build
            <br />
            <em>something useful.</em>
          </h2>

          <p>
            We are open to long-term partnerships, product integrations,
            creative campaigns and ideas that make sense for both sides.
          </p>
        </div>

        <div className="ads-partnership-note">
          <span>not every idea needs an ad.</span>
          <strong>some need a partnership.</strong>
        </div>
      </section>


      {/* CONTACTS */}
      <section className="ads-contact">
        <div className="ads-section-heading">
          <span>04 / contact</span>

          <h2>
           contact
            <br />
            {/* <em>campaign in mind?</em> */}
          </h2>

          <p>
            Tell us a little about your project and what you want to build.
          </p>
        </div>

        <div className="ads-contact-grid">

          <a href="" className="ads-contact-card">
            <span>general</span>
            <strong>@xwlltbot</strong>
            <small>other questions</small>
          </a>


          <a href="" className="ads-contact-card">
            <span>partnerships & advertising</span>
            <strong>xwlltlav@gmail.com</strong>
            <small>collaborations & projects</small>
          </a>


          <a href="" className="ads-contact-card">
            <span>Manager CEO</span>
            <strong>@xlaveq</strong>
            <small>contact for admin</small>
          </a>

        </div>
      </section>


      {/* FOOTER */}
      <footer className="ads-footer">
        <div className="ads-footer-line"></div>

        <p>
          xwallet is built around people, products
          <br />
          and ideas worth noticing.
        </p>

        <span>© 2026 xwallet</span>
      </footer>

    </main>

    </div>
  );
};

export default Ads;
