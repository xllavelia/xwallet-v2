import React, { useState } from 'react';
import { resetAll, useProfile, writeProfile } from './useBalance';
import { readBalance, writeBalance } from './useBalance';

let VALID_CODES = [
    "J7XLAV",
    "I1HFLCJBKJCUG"
];

const PromoCode = () => {
    const [inputValue, setInputValue] = useState("");
    const [message, setMessage] = useState({ text: "", type: "" });

    const handleCheckPromocode = () => {
        const enteredCode = inputValue.trim().toUpperCase();

        if (!enteredCode) {
            setMessage({ text: "error: emprty input", type: "msg-error" });
            return;
        }

        if (enteredCode === "ZERO-1"){
            resetAll
    
}

        if (VALID_CODES.includes(enteredCode)) {
            setMessage({ 
                text: "Great! code: [" + enteredCode + "] work...", 
                type: "msg-success" 
            });
           
writeBalance(readBalance() + 1000)
VALID_CODES.splice(0, 1)         // console.log("active code:", enteredCode);

        } else {
            setMessage({ 
                text: "error: code [" + enteredCode + "] no found.", 
                type: "msg-error" 
            });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleCheckPromocode();
        }
    };

    return (
        <div className="promo-terminal">
          
            
            <div className="input-line">
                <span className="prompt">xwallet@user:~#</span>
                <input 
                    type="text" 
                    className="promo-input" 
                    placeholder="enter the code" 
                    autoComplete="off"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>
            
            <div className={"message-box " + message.type}>
                {message.text}
            </div>
           <div className="promo-btn-d">
            <button className="promo-btn"onClick={handleCheckPromocode}>
                Active
            </button> </div> 
        </div>
    );
};

export default PromoCode;