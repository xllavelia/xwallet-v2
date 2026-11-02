import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuests } from "./useBattlePass";
import { bpCountdown, bpNumber, bpProgressLabel, bpSeasonText, bpXpText } from "./battlepassConfig";
import PassOfferSheet from "./PassOfferSheet";

const CATEGORY_LABEL = { daily: "Daily", weekly: "Weekly", monthly: "Monthly" };

export default function Quests() {
    const navigate = useNavigate();
    const { data, loading, error, refresh, claimQuest, purchasePass } = useQuests();
    const [activeTab, setActiveTab] = useState("daily");
    const [now, setNow] = useState(Date.now());
    const [passOpen, setPassOpen] = useState(false);
    const [toast, setToast] = useState("");
    const [levelUp, setLevelUp] = useState(0);
    const [busyId, setBusyId] = useState(0);

    useEffect(function () {
        const id = window.setInterval(function () { setNow(Date.now()); }, 1000);
        return function () { window.clearInterval(id); };
    }, []);

    useEffect(function () {
        if (!toast) return undefined;
        const id = window.setTimeout(function () { setToast(""); }, 2400);
        return function () { window.clearTimeout(id); };
    }, [toast]);

    useEffect(function () {
        if (!levelUp) return undefined;
        const id = window.setTimeout(function () { setLevelUp(0); }, 1800);
        return function () { window.clearTimeout(id); };
    }, [levelUp]);

    if (loading && !data) {
        return (
            <div className="bp-page bp-center">
                <div className="bp-spinner" />
                <div className="bp-loading-text">Loading quests…</div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="bp-page bp-center">
                <div className="bp-error-title">Could not load quests</div>
                <div className="bp-error-text">{error}</div>
                <button className="bp-retry" type="button" onClick={function () { refresh(false).catch(function () {}); }}>
                    Try again
                </button>
            </div>
        );
    }

    if (!data) return null;

    const tabs = data.tabs || [];
    const tab = tabs.find(function (t) { return t.key === activeTab; }) || tabs[0];
    const quests = tab ? tab.quests || [] : [];
    const pct = data.level >= 50 ? 100 : Math.min(100, (data.levelXp / data.xpPerLevel) * 100);

    function handleClaim(quest) {
        if (quest.claimed || !quest.completed || busyId) return;
        if (quest.paid && !data.passOwned) {
            setPassOpen(true);
            return;
        }
        setBusyId(quest.id);
        claimQuest(quest.id)
            .then(function (result) {
                setToast("+" + result.xpGained + " XP");
                if (result.leveledUp) setLevelUp(result.level);
            })
            .catch(function (e) {
                setToast(e && e.message ? e.message : "Could not claim the quest");
            })
            .finally(function () { setBusyId(0); });
    }

    function handleBuy() {
        return purchasePass().then(function (result) {
            setToast("Battle Pass unlocked — pass quests are live");
            return result;
        });
    }

    return (
        <div className="bp-page bp-quests-page">
            <header className="bp-head">
                <div className="bp-head-main">
                    <h1>Quests</h1>
                    <div className="bp-season-row">
                        <span className="bp-season">{bpSeasonText(data.season)}</span>
                    </div>
                </div>
            </header>

            <p className="bp-goal">Daily, weekly and monthly goals.</p>

            <div className="bp-level-card bp-level-card--quests">
                <div className="bp-level-main">
                    <span className="bp-level-label">LEVEL</span>
                    <strong className="bp-level-value">{data.level}</strong>
                    <span className="bp-level-max">/ 50</span>
                </div>
                <div className="bp-level-bar"><span style={{ width: pct + "%" }} /></div>
                <div className="bp-level-meta">
                    <span>{bpXpText(data.level, data.levelXp, data.xpPerLevel, 50)}</span>
                    <span>{bpNumber(data.xp)} total XP</span>
                </div>
            </div>

            <div className="bp-tabs" role="tablist">
                {tabs.map(function (t) {
                    return (
                        <button
                            key={t.key}
                            type="button"
                            role="tab"
                            aria-selected={tab && tab.key === t.key}
                            className={"bp-tab" + (tab && tab.key === t.key ? " is-active" : "")}
                            onClick={function () { setActiveTab(t.key); }}
                        >
                            {t.label}
                        </button>
                    );
                })}
            </div>

            <div className="bp-tab-meta">
                {tab && tab.resetsAt
                    ? <span>Resets in {bpCountdown(tab.resetsAt, now)}</span>
                    : <span>Pass quests reset with their daily, weekly or monthly period</span>}
                <span>{quests.filter(function (q) { return q.claimed; }).length}/{quests.length} claimed</span>
            </div>

            {activeTab === "pass" && !data.passOwned && (
                <button className="bp-q-pass-banner" type="button" onClick={function () { setPassOpen(true); }}>
                    <span>Pass quests</span>
                    <b>Unlock the pass to claim them</b>
                </button>
            )}

            <div className="bp-quest-scroll">
                {quests.length === 0 && (
                    <div className="bp-quest-empty">No quests in this tab yet. They will appear with the next period.</div>
                )}

                {quests.map(function (quest) {
                    const progressPct = quest.target > 0 ? Math.min(100, (quest.progress / quest.target) * 100) : 0;
                    const locked = quest.paid && !data.passOwned;
                    return (
                        <div
                            className={"bp-quest" + (quest.claimed ? " is-claimed" : "") + (quest.completed ? " is-complete" : "") + (quest.paid ? " is-paid" : "")}
                            key={quest.id}
                        >
                            <div className="bp-quest-top">
                                <div className="bp-quest-title">{quest.title}</div>
                                <div className="bp-quest-xp">+{quest.xp} XP</div>
                            </div>
                            <div className="bp-quest-meta">
                                <span>{activeTab === "pass" ? (CATEGORY_LABEL[quest.category] || quest.category) : quest.paid ? "PASS ONLY" : "FREE"}</span>
                                <span>{bpProgressLabel(quest)}</span>
                            </div>
                            <div className="bp-quest-bar"><span style={{ width: progressPct + "%" }} /></div>
                            <div className="bp-quest-action">
                                {quest.claimed ? (
                                    <span className="bp-q-claimed">Claimed</span>
                                ) : quest.completed ? (
                                    <button
                                        className={"bp-q-action" + (locked ? " is-ghost" : "")}
                                        type="button"
                                        disabled={busyId === quest.id}
                                        onClick={function () { handleClaim(quest); }}
                                    >
                                        {locked ? "Unlock pass" : busyId === quest.id ? "Claiming…" : "Claim +" + quest.xp + " XP"}
                                    </button>
                                ) : (
                                    <span className="bp-q-wait">In progress</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {toast && <div className="bp-toast">{toast}</div>}

            {levelUp > 0 && (
                <div className="bp-levelup" onClick={function () { setLevelUp(0); }}>
                    <div className="bp-levelup-inner">
                        <span>LEVEL UP</span>
                        <strong>{levelUp}</strong>
                        <small>New rewards are waiting</small>
                    </div>
                </div>
            )}

            <PassOfferSheet
                open={passOpen}
                onClose={function () { setPassOpen(false); }}
                season={data.season}
                price={data.passPrice}
                balance={data.lavxBalance}
                owned={data.passOwned}
                onBuy={handleBuy}
            />
        </div>
    );
}