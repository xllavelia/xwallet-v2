import { useEffect, useMemo, useRef, useState } from "react";
import { BP_PRICE_FALLBACK, bpNumber, bpSeasonText } from "./battlepassConfig";

const FEATURES = [
    "Both reward tracks for the whole season",
    "2 extra daily quests",
    "1 extra weekly and 1 extra monthly quest",
    "Premium reward on every one of 50 levels",
    "Legendary case at level 1"
];

export default function PassOfferSheet({ open, onClose, season, price, balance, owned, onBuy }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [celebrate, setCelebrate] = useState(false);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const timer = useRef(0);

    const finalPrice = Number(price || BP_PRICE_FALLBACK);
    const lavx = Number(balance || 0);
    const enough = lavx >= finalPrice;

    useEffect(function () {
        if (!open) return undefined;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = function (e) {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return function () {
            document.body.style.overflow = previous;
            window.removeEventListener("keydown", onKey);
            window.clearTimeout(timer.current);
        };
    }, [open, onClose]);

    const confetti = useMemo(function () {
        if (!celebrate) return [];
        return Array.from({ length: 26 }, function (_, i) {
            return {
                id: i,
                left: 8 + Math.random() * 84,
                delay: Math.random() * 0.3,
                drift: (Math.random() - 0.5) * 140,
                spin: Math.random() * 720 - 360,
                size: 4 + Math.random() * 7
            };
        });
    }, [celebrate]);

    if (!open) return null;

    function handleBuy() {
        if (busy || owned || !enough) return;
        setBusy(true);
        setError("");
        Promise.resolve(onBuy())
            .then(function () {
                setCelebrate(true);
                if (navigator.vibrate) navigator.vibrate([12, 40, 18]);
                window.clearTimeout(timer.current);
                timer.current = window.setTimeout(function () { setCelebrate(false); }, 2200);
            })
            .catch(function (e) {
                setError(e && e.message ? e.message : "Could not unlock the pass");
            })
            .finally(function () { setBusy(false); });
    }

    function handleMove(e) {
        if (e.pointerType === "touch") return;
        const rect = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x: py * -9, y: px * 11 });
    }

    return (
        <div className="bp-overlay bp-overlay--sheet" onMouseDown={function (e) { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bp-sheet bp-pass-sheet" role="dialog" aria-modal="true" aria-label="Battle Pass">

                {celebrate && (
                    <div className="bp-confetti" aria-hidden="true">
                        {confetti.map(function (p) {
                            return (
                                <span
                                    key={p.id}
                                    style={{
                                        left: p.left + "%",
                                        width: p.size + "px",
                                        height: p.size * 2.4 + "px",
                                        animationDelay: p.delay + "s",
                                        "--bp-drift": p.drift + "px",
                                        "--bp-spin": p.spin + "deg"
                                    }}
                                />
                            );
                        })}
                    </div>
                )}

                <div
                    className={"bp-ticket" + (owned ? " is-owned" : "") + (celebrate ? " is-celebrating" : "")}
                    style={{ transform: "rotateX(" + tilt.x + "deg) rotateY(" + tilt.y + "deg)" }}
                    onPointerMove={handleMove}
                    onPointerLeave={function () { setTilt({ x: 0, y: 0 }); }}
                >
                    <div className="bp-ticket-shine" aria-hidden="true" />
                    <div className="bp-ticket-crown" aria-hidden="true"><span /><span /><span /></div>
                    <div className="bp-ticket-kicker">XWALLET · BATTLE PASS</div>
                    <div className="bp-ticket-season">{bpSeasonText(season)}</div>
                    <div className="bp-ticket-sub">50 levels · free + premium · one season</div>

                    <div className="bp-ticket-perforation" aria-hidden="true" />
           

                    <ul className="bp-ticket-features">
                        {FEATURES.map(function (feature) {
                            return <li key={feature}><span className="bp-dot" />{feature}</li>;
                        })}
                    </ul>

                    <div className="bp-ticket-price">
                        <span className="bp-ticket-price-label">Price</span>
                        <strong>{bpNumber(finalPrice)} <em>LAVX</em></strong>
                    </div>
                    <div className="bp-ticket-balance">
                        Your balance: <b>{bpNumber(lavx)} LAVX</b>
                    </div>

                    {!owned && !enough && (
                        <div className="bp-ticket-warn">Need {bpNumber(finalPrice - lavx)} more LAVX</div>
                    )}
                    {error && <div className="bp-ticket-error">{error}</div>}

                    <button
                        className="bp-buy-btn"
                        type="button"
                        disabled={busy || owned || !enough}
                        onClick={handleBuy}
                    >
                        {owned ? "Pass active" : busy ? "Unlocking…" : enough ? "Unlock for " + bpNumber(finalPrice) + " LAVX" : "Not enough LAVX"}
                    </button>

                    {owned && <div className="bp-ticket-stamp">ACTIVE</div>}
                </div>
            </div>
        </div>
    );
}