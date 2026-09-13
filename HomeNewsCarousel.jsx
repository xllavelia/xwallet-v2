import React, { useRef, useState } from "react";


function HomeNewsCarousel() {
 

  return (
     <section className="crypto-section">
      <div className="crypto-cards">
        {/* Card 1 */}
        <article className="crypto-card">
          <div className="crypto-card__content">
            <h2>
              Crypto The
              <br />
              Impact of
              <br />
              Cryptocurrency
              <br />
              Volatility on
              <br />
              Trading
            </h2>

            <p>
              Gain insight into how we
              <br />
              help you successfully
              <br />
              navigate the volatility
              <br />
              of cryptocurrencies
            </p>
          </div>

          <button className="crypto-card__arrow" aria-label="Next">
            {/* <span>→</span> */}
          </button>
        </article>

        {/* Card 2 */}
        <article className="crypto-card crypto-card--second">
          <div className="crypto-card__content">
            <h2>
              Understanding
              <br />
              Trading
              <br />
              Position
              <br />
              Management
            </h2>

            <p>
              Learn the basics
              <br />
              of trading and risk
              <br />
              management
              <br />
              and responsible
              <br />
              trading in this easy
              <br />
              guide
            </p>
          </div>
             <button className="crypto-card__arrow" aria-label="Next">
            {/* <span>→</span> */}
          </button>
        </article>
      </div>
    </section>
  );
}

export default HomeNewsCarousel;