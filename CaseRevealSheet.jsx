import { useEffect, useRef, useState } from "react";
import { bpCaseTitle, bpCosmeticId, bpRewardText } from "./battlepassConfig";
import { CosmeticRewardArt } from "./ProfileShared";

const ITEM_W = 86;
const GAP = 10;
const STEP = ITEM_W + GAP;
const WINNER = 30;
const REEL_LEN = 36;
const VIEWPORT = 300;
const TARGET_SHIFT = -(WINNER * STEP + ITEM_W / 2 - VIEWPORT / 2);

export default function CaseRevealSheet({ open, item, catalog, onClose, onOpen }) {
    const [phase, setPhase] = useState("idle");
    const [roll, setRoll] = useState(null);
    const [error, setError] = useState("");
    const [spin, setSpin] = useState(false);
    const [shift, setShift] = useState(0);
    const [attempt, setAttempt] = useState(0);
    const timers = useRef([]);

    const rarity = item ? item.rarity : "";
    const def = catalog && catalog.cases ? catalog.cases[rarity] : null;
    const entries = def && def.entries ? def.entries : [];

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
        };
    }, [open, onClose]);

    useEffect(function () {
        if (!open || !item) return undefined;
        setPhase("idle");
        setRoll(null);
        setError("");
        setSpin(false);
        setShift(0);

        let cancelled = false;
        Promise.resolve(onOpen(item.id))
            .then(function (result) {
                if (cancelled) return;
                const nextRoll = result && result.roll ? result.roll : null;
                setRoll(nextRoll);
                if (!nextRoll) {
                    setError("Could not open this case");
                    return;
                }
                window.dispatchEvent(new Event("xw-profile-changed"));
                window.dispatchEvent(new Event("xw-accounts-changed"));
                if (result.alreadyOpened || document.documentElement.classList.contains("xw-reduce-motion") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                    setShift(TARGET_SHIFT);
                    setPhase("done");
                    return;
                }
                setPhase("spinning");
                const t1 = window.setTimeout(function () {
                    setSpin(true);
                    setShift(TARGET_SHIFT);
                }, 30);
                const t2 = window.setTimeout(function () {
                    setPhase("done");
                    if (navigator.vibrate) navigator.vibrate([14, 30, 22]);
                }, 3550);
                timers.current.push(t1, t2);
            })
            .catch(function (e) {
                if (!cancelled) setError(e && e.message ? e.message : "Could not open the case");
            });

        return function () {
            cancelled = true;
            timers.current.forEach(function (id) { window.clearTimeout(id); });
            timers.current = [];
        };
    }, [open, item, attempt, onOpen]);

    if (!open || !item) return null;

    const reelItems = [];
    if (entries.length > 0) {
        for (let i = 0; i < REEL_LEN; i += 1) {
            reelItems.push(entries[i % entries.length]);
        }
        if (roll && roll.entry) reelItems[WINNER] = roll.entry;
    }

    const odds = entries.slice().sort(function (a, b) { return b.chance - a.chance; });
    const done = phase === "done";
    const spinning = phase === "spinning";

    return (
        <div className="bp-overlay bp-overlay--center" onMouseDown={function (e) { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bp-sheet bp-case-sheet" role="dialog" aria-modal="true" aria-label={bpCaseTitle(rarity) + " case"}>

                <div className={"bp-case-hero is-" + rarity}>
                    
                    <div className="bp-case-meta">
                        <div className="bp-case-rarity">{bpCaseTitle(rarity)}</div>
                        <div className="bp-case-title">{def ? def.title : "Case"}</div>
                        <div className="bp-case-sub">{def ? def.subtitle : ""}</div>
                    </div>
                </div>

                <div className="bp-reel-viewport">
                    <div className="bp-reel-pointer" aria-hidden="true" />
                    <div className="bp-reel-fade bp-reel-fade--left" aria-hidden="true" />
                    <div className="bp-reel-fade bp-reel-fade--right" aria-hidden="true" />
                    <div
                        className="bp-reel-track"
                        style={{
                            transform: "translate3d(" + shift + "px, 0, 0)",
                            transition: spin ? "transform 3.4s cubic-bezier(.08,.72,.12,1)" : "none"
                        }}
                    >
                        {reelItems.map(function (entry, index) {
                            return (
                                <div
                                    className={"bp-reel-item" + (done && index === WINNER ? " is-winner" : "")}
                                    key={index}
                                >
                                    <span className="bp-reel-kind">{bpCosmeticId(entry) ? (entry.cosmeticKind || bpCosmeticId(entry).split("-")[0]).toUpperCase() : entry.kind.toUpperCase()}</span>
                                    <CosmeticRewardArt reward={entry} />
                                    <b>{bpRewardText(entry)}</b>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {error && <div className="bp-case-error">{error}</div>}

                {done && roll && (
                    <div className="bp-case-result">
                        <div className="bp-case-result-kicker">{roll.note ? "CONVERTED" : "YOU GOT"}</div>
                        <CosmeticRewardArt reward={roll.entry} />
                        <div className="bp-case-result-value">{roll.entry ? bpRewardText(roll.entry) : "—"}</div>
                        {roll.note && <div className="bp-case-result-note">{roll.note}</div>}
                    </div>
                )}

                <div className="bp-case-odds">
                    <div className="bp-case-odds-title">Possible rewards</div>
                    <div className="bp-case-odds-list">
                        {odds.map(function (entry) {
                            return (
                                <div className="bp-case-odd" key={entry.index}>
                                    <span><CosmeticRewardArt reward={entry} />{bpRewardText(entry)}</span>
                                    <b>{entry.chance}%</b>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {phase === "idle" && (
                    <button className="bp-case-open-btn" type="button" onClick={function () { setAttempt(attempt + 1); }}>
                        {error ? "Try again" : "Open case"}
                    </button>
                )}
                {spinning && <div className="bp-case-opening">Opening…</div>}
                {done && (
                    <button className="bp-case-open-btn" type="button" onClick={onClose}>
                        Collect
                    </button>
                )}
                {phase === "done" && <div className="bp-case-tiny">Reward was added to your account</div>}
            </div>
        </div>
    );
}