import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBattlePass } from "./useBattlePass";
import { bpNumber, bpRewardText, bpSeasonText, bpXpText } from "./battlepassConfig";
import PassOfferSheet from "./PassOfferSheet";
import CaseRevealSheet from "./CaseRevealSheet";
import { CosmeticRewardArt } from "./ProfileShared";

export default function BattlePass() {
    const navigate = useNavigate();
    const { data, loading, error, refresh, purchasePass, claimReward, openCase } = useBattlePass();
    const [passOpen, setPassOpen] = useState(false);
    const [caseItem, setCaseItem] = useState(null);
    const [toast, setToast] = useState("");
    const [busyCell, setBusyCell] = useState("");
    const toastTimer = useRef(0);
    const scrollRef = useRef(null);
    const scrolledFor = useRef(0);

    useEffect(function () {
        return function () { window.clearTimeout(toastTimer.current); };
    }, []);

    function showToast(message) {
        setToast(message);
        window.clearTimeout(toastTimer.current);
        toastTimer.current = window.setTimeout(function () { setToast(""); }, 2600);
    }

    useEffect(function () {
        if (!data || !scrollRef.current) return undefined;
        if (scrolledFor.current === data.level) return undefined;
        scrolledFor.current = data.level;
        const id = window.setTimeout(function () {
            const container = scrollRef.current;
            const el = document.getElementById("bp-level-" + data.level);
            if (!container || !el) return;
            container.scrollTo({
                top: Math.max(0, el.offsetTop - container.clientHeight / 2 + el.offsetHeight / 2),
                behavior: "smooth"
            });
        }, 80);
        return function () { window.clearTimeout(id); };
    }, [data]);

    if (loading && !data) {
        return (
            <div className="bp-page bp-center">
                <div className="bp-spinner" />
                <div className="bp-loading-text">Loading Battle Pass…</div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="bp-page bp-center">
                <div className="bp-error-title">Could not load Battle Pass</div>
                <div className="bp-error-text">{error}</div>
                <button className="bp-retry" type="button" onClick={function () { refresh(false).catch(function () {}); }}>
                    Try again
                </button>
            </div>
        );
    }

    if (!data) return null;

    const pct = data.level >= data.maxLevel ? 100 : Math.min(100, (data.levelXp / data.xpPerLevel) * 100);

    function rowClass(levelState) {
        let cls = "bp-row";
        cls += levelState.unlocked ? " is-open" : " is-locked";
        if (levelState.level === data.level) cls += " is-current";
        return cls;
    }

    function cellClass(levelState, track) {
        const cell = track === "free" ? levelState.free : levelState.pass;
        const passLocked = levelState.unlocked && track === "pass" && !data.passOwned && !cell.claimed;
        let cls = "bp-cell";
        if (!levelState.unlocked) cls += " is-locked";
        if (cell.claimed) cls += " is-claimed";
        if (passLocked) cls += " is-pass-locked";
        if (levelState.unlocked && !cell.claimed && !passLocked) cls += " is-available";
        if (cell.pendingCaseId) cls += " is-pending";
        if (busyCell === levelState.level + ":" + track) cls += " is-busy";
        return cls;
    }

    function renderCell(levelState, track) {
        const cell = track === "free" ? levelState.free : levelState.pass;
        const rewards = cell.rewards || [];
        const locked = !levelState.unlocked;
        const passLocked = !locked && track === "pass" && !data.passOwned && !cell.claimed;
        return (
            <>
                <div className="bp-cell-rewards">
                    {rewards.map(function (reward, index) {
                        return <span className="bp-reward" key={index}><CosmeticRewardArt reward={reward} />{bpRewardText(reward)}</span>;
                    })}
                </div>
                {cell.claimed && <span className="bp-cell-check">✓</span>}
                {!cell.claimed && cell.pendingCaseId > 0 && <span className="bp-cell-tag is-accent">OPEN</span>}
                {!cell.claimed && !cell.pendingCaseId && !locked && !passLocked && levelState.level === data.level && (
                    <span className="bp-cell-tag is-accent">CLAIM</span>
                )}
                {!cell.claimed && !locked && passLocked && levelState.level === data.level && (
                    <span className="bp-cell-tag">PASS</span>
                )}
            </>
        );
    }

    function handleCell(levelState, track) {
        if (busyCell) return;
        const cell = track === "free" ? levelState.free : levelState.pass;

        if (!levelState.unlocked) {
            const needed = Math.max(0, (levelState.level - 1) * data.xpPerLevel - data.xp);
            showToast("Need " + bpNumber(needed) + " XP to unlock this level");
            return;
        }
        if (cell.claimed) {
            showToast("Already claimed");
            return;
        }
        if (cell.pendingCaseId) {
            const pending = (data.pendingCases || []).find(function (p) { return p.id === cell.pendingCaseId; });
            if (pending) {
                setCaseItem(pending);
            } else {
                const caseReward = (cell.rewards || []).find(function (r) { return r.kind === "case"; });
                setCaseItem({
                    id: cell.pendingCaseId,
                    rarity: caseReward ? caseReward.case : "common",
                    title: "Case",
                    source: "level",
                    level: levelState.level,
                    track: track
                });
            }
            return;
        }
        if (track === "pass" && !data.passOwned) {
            setPassOpen(true);
            return;
        }

        const key = levelState.level + ":" + track;
        setBusyCell(key);
        claimReward(levelState.level, track)
            .then(function (result) {
                window.dispatchEvent(new Event("xw-profile-changed"));
                window.dispatchEvent(new Event("xw-accounts-changed"));
                const names = (result.rewards || []).map(bpRewardText).join(" · ");
                showToast(names ? "Claimed: " + names : "Reward claimed");
                if (result.caseTokenId) {
                    setCaseItem({
                        id: result.caseTokenId,
                        rarity: result.caseRarity || "common",
                        title: "Case",
                        source: "level",
                        level: levelState.level,
                        track: track
                    });
                }
            })
            .catch(function (e) {
                showToast(e && e.message ? e.message : "Could not claim the reward");
            })
            .finally(function () { setBusyCell(""); });
    }

    function handleBuy() {
        return purchasePass().then(function (result) {
            showToast("Battle Pass unlocked — premium track is live");
            return result;
        });
    }

    function closeCase() {
        setCaseItem(null);
        refresh(true).catch(function () {});
    }

    return (
        <div className="bp-page">
            <header className="bp-head">
                <div className="bp-head-main">
                    <h1>Battle Pass</h1>
                    <div className="bp-season-row">
                        <span className="bp-season">{bpSeasonText(data.season)}</span>
                        <button
                            className={"bp-pass-chip" + (data.passOwned ? " is-active" : "")}
                            type="button"
                            onClick={function () { setPassOpen(true); }}
                        >
                            {data.passOwned ? "PASS ACTIVE" : "GET PASS"}
                        </button>
                    </div>
                </div>
            </header>

            <p className="bp-goal">Earn XP in every game. Claim rewards on both tracks.</p>

            <div className="bp-level-card">
                <div className="bp-level-main">
                    <span className="bp-level-label">LEVEL</span>
                    <strong className="bp-level-value">{data.level}</strong>
                    <span className="bp-level-max">/ {data.maxLevel}</span>
                </div>
                <div className="bp-level-bar"><span style={{ width: pct + "%" }} /></div>
                <div className="bp-level-meta">
                    <span>{bpXpText(data.level, data.levelXp, data.xpPerLevel, data.maxLevel)}</span>
                    <span>{bpNumber(data.xp)} total XP</span>
                </div>
            </div>

            <div className="bp-road-head">
                <span />
                <span>FREE</span>
                <span>PASS</span>
            </div>

            <div className="bp-road-scroll" ref={scrollRef}>
                <div className="bp-road">
                    {data.levels.map(function (levelState) {
                        return (
                            <div id={"bp-level-" + levelState.level} className={rowClass(levelState)} key={levelState.level}>
                                <div className="bp-level-index">
                                    <small>{String(levelState.level).padStart(2, "0")}</small>
                                    {!levelState.unlocked && <span className="bp-lockdot" />}
                                </div>
                                <button
                                    className={cellClass(levelState, "free")}
                                    type="button"
                                    onClick={function () { handleCell(levelState, "free"); }}
                                    aria-label={"Level " + levelState.level + " free reward"}
                                >
                                    {renderCell(levelState, "free")}
                                </button>
                                <button
                                    className={cellClass(levelState, "pass")}
                                    type="button"
                                    onClick={function () { handleCell(levelState, "pass"); }}
                                    aria-label={"Level " + levelState.level + " pass reward"}
                                >
                                    {renderCell(levelState, "pass")}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="bp-bottom">
                <button className="bp-quests-cta" type="button" onClick={function () { navigate("/quests"); }}>
                    <span>Quests</span>
                    <small>Daily · Weekly · Monthly</small>
                </button>
            </div>

            {toast && <div className="bp-toast">{toast}</div>}

            <PassOfferSheet
                open={passOpen}
                onClose={function () { setPassOpen(false); }}
                season={data.season}
                price={data.passPrice}
                balance={data.lavxBalance}
                owned={data.passOwned}
                onBuy={handleBuy}
            />

            <CaseRevealSheet
                open={!!caseItem}
                item={caseItem}
                catalog={data.caseCatalog}
                onClose={closeCase}
                onOpen={openCase}
            />
        </div>
    );
}