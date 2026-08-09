import React, { useState, useEffect } from "react";
import { useWalletBalance } from "./useWallet";
import { useAccount } from "./useAccount";

const LoadingGate = (props) => {
  var { wallet, isLoading } = useWalletBalance();
  const { account } = useAccount();

  var [phase, setPhase] = useState("intro"); // "intro" | "welcome" | "done"
  var [collapsing, setCollapsing] = useState(false);

  var balanceReady = !isLoading && wallet && typeof wallet.balance === "number";

  useEffect(function () {
    var timer = setTimeout(function () {
      setPhase("welcome");
    }, 3500);
    return function () { clearTimeout(timer); };
  }, []);

  useEffect(function () {
    if (phase === "welcome" && balanceReady) {
      setCollapsing(true);
      var timer = setTimeout(function () {
        setPhase("done");
      }, 10);
      return function () { clearTimeout(timer); };
    }
  }, [phase, balanceReady]);

  if (phase === "done") {
    return props.children;
  }

  var username = (wallet && wallet.username) || "";

  return (
    <div className="lg-root">   
    
    <div className="welcome-block">
              <h1>Welcome! <br /> <span>{account?.username}</span></h1>
            </div>
            
      <div className={"lg-frame " + (phase === "intro" ? "lg-frame-intro" : "lg-frame-welcome") + (collapsing ? " lg-frame-collapsing" : "")}>
 
        {phase === "intro" && (
            <div>
        
         
          <div className="lg-intro">
            <div className="lg-orb lg-orb-1"></div>
            <div className="lg-orb lg-orb-2"></div>
            <div className="lg-ring lg-ring-1"></div>
            <div className="lg-ring lg-ring-2"></div>
            <div className="lg-sparkle"></div>
            <div className="lg-burst">
              <div className="lg-burst-core"></div>
            </div>
          </div>  
           </div>
        )}

        {/* {phase === "welcome" && (
          <div className="lg-welcome">
            <span className="lg-welcome-label">WELCOME</span>
            <span className="lg-welcome-name">{username}</span>
            {!balanceReady && <div className="lg-welcome-pulse"></div>}
          </div>
        )} */}

      </div>

      <div className="lg-block-touch"></div>
    </div>
  );
};

export default LoadingGate;

