import React from 'react';

const WalletAesthetic = () => {
  return (
    <section className="wallet-canvas">
      {/* Фоновые кольца - они огромные, но тонкие и уходят на задний план */}
      <div className="rings-background">
        <div className="orbit orbit-1"></div>
        <div className="orbit orbit-2"></div>
        <div className="orbit orbit-3"></div>
        <div className="ambient-flare"></div>
      </div>

      {/* Контент, распределенный по всему экрану */}
      <div className="canvas-content">
        
        {/* Верхняя статусная строка (в стиле tech/crypto) */}
        <div className="status-bar animate-reveal step-1">
          <div className="status-item hidden-mobile">
            <span className="mono-text opacity-50">LATEST BLOCK:</span>
            <span className="mono-text highlight">0x8a7f...9b21</span>
          </div>
        </div>

        {/* Центральная массивная типографика */}
        <div className="massive-typography">
          <h2 className="tech-eyebrow animate-reveal step-2">NEW GENERATION WALLET</h2>
          <div className="cursive-group animate-reveal step-3">
            <h1 className="cursive-text main-cursive">xwallet own</h1>
            <h1 className="cursive-text sub-cursive">your flow</h1>
          </div>
        </div>

        {/* Стеклянная карточка с балансом (парящая) */}
        <div className="glass-balance-card float-anim animate-reveal step-4">
          <p className="card-label">Total Portfolio</p>
          <p className="card-amount">$4,208,159.00</p>
          <div className="card-footer">
            <span className="mono-text wallet-address">0x39...A9B</span>
            <span className="badge">PROTECTED</span>
          </div>
        </div>

        {/* Нижний правый угол - дерзкий акцент */}
        <div className="bottom-corner-accent animate-reveal step-5">
          <span className="marker-text">Your keys. Your rules.</span>
         
        </div>

      </div>
    </section>
  );
};

export default WalletAesthetic;