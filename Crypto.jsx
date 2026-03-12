import React from "react";
  import { useNavigate } from "react-router-dom";

const Crypto = () => {
  console.log("crypto render")
   const navigate = useNavigate();

const roadCrypto = () => {
    navigate("/crypto");
  };

const roadHome = () => {
    navigate("/");
  };

  return ( 
  <div>

    
{/* <div className="home-text-mr-parent"><h1 className="home-text-mr">Monthly Report</h1></div> */}

<div className="crypto-karta-parent">
    <fieldset className="crypto-karta">
   <div className="crypto-karta-text">

   <h1 className="crypto-karta-h1"> <svg width="1rem" height="1rem" className="crypto-karta-svg" viewBox="0 0 24 24" fill="" xmlns="http://www.w3.org/2000/svg">
<path d="M20 9.71429V6.28571C20 5.02335 19.1046 4 18 4H4C2.89543 4 2 5.02335 2 6.28571V17.7143C2 18.9767 2.89543 20 4 20H18C19.1046 20 20 18.9767 20 17.7143V14.2857M22 9.71429H16C14.8954 9.71429 14 10.7376 14 12C14 13.2624 14.8954 14.2857 16 14.2857H22V9.71429Z" stroke="" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
</svg> Balance</h1>
    <h1 className="crypto-karta-text-h1">
      
            7.500usd   

    </h1>
 {/* <div className="crypto-karta-text-graf-grandparent"> */}
   {/* <div className="crypto-karta-text-graf-parent">
       <div className="crypto-karta-text-graf"></div>
       
    </div>  */}
  <br />
    <h1 className="crypto-karta-text-profit">total profit: <br /> 4.689$ </h1> 
<h1 className="crypto-karta-text-span">+71.2%</h1> 
</div>
<br />
{/* </div> */}
    {/* Правая часть: Кнопка сo стрелкой */}
   </fieldset>
  </div>

<div className="crypto-card">
  <div className="card-header">
    <div className="coin">
      <div className="coin-icon">₿</div>
      <span>Bitcoin</span>
    </div>
    <div className="currency">USD ▾</div>
  </div>

  <div className="balance">
    <h1>108,61 BTC</h1>
    <p>$213,017.17</p>
  </div>

  <div className="profit">
    <span>Profit today</span>
    <div className="profit-values">
      <span className="profit-money">+$1,237.45</span>
      <span className="profit-percent">+5%</span>
    </div>
  </div>

  <div className="buttons">
    <button className="btn-outline">Swap</button>
    <button className="btn-buy">Buy</button>
    <button className="btn-send">Send</button>
  </div>
</div>

  <h1 className="crypto">crypto Page</h1>
    <div className="lend-div">
<div className="lend">
<p  className="lend-wallet" onClick={roadHome} >wallet</p>
<p className="lend-portfolio" onClick={roadCrypto}>crypto</p>


<h1  className="lend-seting">setting</h1>
</div>
</div>

  </div> 
  );
};

export default Crypto;
