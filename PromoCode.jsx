import React, { useState } from 'react';
import { authFetch } from './apiClient';

const PromoCode = () => {
    const [inputValue, setInputValue] = useState("");
    const [message, setMessage] = useState({ text: "", type: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleCheckPromocode() {
        const enteredCode = inputValue.trim().toUpperCase();

        if (!enteredCode) {
            setMessage({ text: "error: empty input", type: "msg-error" });
            return;
        }
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const result = await authFetch('/promo/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: enteredCode })
            });
            setMessage({ text: result.message, type: "msg-success" });
            setInputValue("");
        } catch (err) {
            setMessage({ text: "error: " + err.message, type: "msg-error" });
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            handleCheckPromocode();
        }
    }

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
                    disabled={isSubmitting}
                />
            </div>

            <div className={"message-box " + message.type}>
                {message.text}
            </div>

            <div className="promo-btn-d">
                <button className="promo-btn" onClick={handleCheckPromocode} disabled={isSubmitting}>
                    {isSubmitting ? "Checking..." : "Active"}
                </button>
            </div>
        </div>
    );
};

export default PromoCode;