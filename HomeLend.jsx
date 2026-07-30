import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  usePositions,
  useTradeHistory,
  useProfile,
  useTransfers,
} from "./useBalance";
import { useWalletBalance } from "./useWallet";

const NAV_TARGETS = {
  home: "/homelend",
  send: "/send",
  buy: "/buy",
  get: "/get",
  setting: "/setting",
  history: "/history",
  bonus: "/bonus",
  referral: "/referral",
  card: "/card",
  battlepass: "/battlepass",
  ads: "/ads",
  trade: { path: "/trade", state: "BTC" },
  emblem: "/emblem",
  about: "/about",
  prime: "/prime",
  promocode: "/promocode",
};

const NAV_STEP_DELAY_MS = 20;

function safeNum(val) {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}

const HomeLend = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const { wallet } = useWalletBalance();
  const positions = usePositions();
  const tradeHistory = useTradeHistory();
  const profile = useProfile();
  const transfers = useTransfers();

  const goVia = useCallback(
    (key) => {
      const target = NAV_TARGETS[key];
      navigate(-1);
      const timer = setTimeout(() => {
        if (typeof target === "string") {
          navigate(target);
        } else {
          navigate(target.path, { state: target.state });
        }
      }, NAV_STEP_DELAY_MS);
      return () => clearTimeout(timer);
    },
    [navigate]
  );

  const balanceStr = useMemo(
    () => (wallet.balance ?? 0).toFixed(2),
    [wallet.balance]
  );

  const stats = useMemo(() => {
    const now = Date.now();
    const closedWins = tradeHistory.filter((t) => t.result === "win");
    const last24h = tradeHistory.filter(
      (t) => now - safeNum(t.closeTime) < 86400000
    );
    const last7d = tradeHistory.filter(
      (t) => now - safeNum(t.closeTime) < 604800000
    );

    const profit24h = last24h.reduce((acc, t) => acc + safeNum(t.pnl), 0);
    const profit7d = last7d.reduce((acc, t) => acc + safeNum(t.pnl), 0);

    const totalIncome = tradeHistory
      .filter((t) => safeNum(t.pnl) > 0)
      .reduce((acc, t) => acc + safeNum(t.pnl), 0);

    const totalOutcome = tradeHistory
      .filter((t) => safeNum(t.pnl) < 0)
      .reduce((acc, t) => acc + Math.abs(safeNum(t.pnl)), 0);

    const winRate =
      tradeHistory.length > 0
        ? parseFloat(
            ((closedWins.length / tradeHistory.length) * 100).toFixed(1)
          )
        : 0;

    const cashbackEarned = tradeHistory.reduce(
      (acc, t) => acc + safeNum(t.fees) * 0.1,
      0
    );

    return {
      profit24h,
      profit7d,
      totalIncome,
      totalOutcome,
      winRate,
      cashbackEarned,
      activeTrades: positions.length,
      profit24hStr: (profit24h >= 0 ? "+" : "-") + Math.abs(profit24h).toFixed(2),
      profit7dStr: (profit7d >= 0 ? "+" : "-") + Math.abs(profit7d).toFixed(2),
    };
  }, [tradeHistory, positions]);

  return (
    <div className="BonusContent">


    <div className="actions-floating-grid-">
        <div className="action-circle" onClick={() => goVia("send")}>
          <div className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m6 15l6-6l6 6"
              />
            </svg>
          </div>
        </div>

        <div className="action-circle x-primary" onClick={() => goVia("history")}>
          <div className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <g
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 7v5l3 3" />
              </g>
            </svg>
          </div>
        </div>

        <div className="action-circle" onClick={() => goVia("referral")}>
          <div className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 11q.825 0 1.413-.588Q14 9.825 14 9t-.587-1.413Q12.825 7 12 7q-.825 0-1.412.587Q10 8.175 10 9q0 .825.588 1.412Q11.175 11 12 11Zm0 2q-1.65 0-2.825-1.175Q8 10.65 8 9q0-1.65 1.175-2.825Q10.35 5 12 5q1.65 0 2.825 1.175Q16 7.35 16 9q0 1.65-1.175 2.825Q13.65 13 12 13Zm0 11q-2.475 0-4.662-.938q-2.188-.937-3.825-2.574Q1.875 18.85.938 16.663Q0 14.475 0 12t.938-4.663q.937-2.187 2.575-3.825Q5.15 1.875 7.338.938Q9.525 0 12 0t4.663.938q2.187.937 3.825 2.574q1.637 1.638 2.574 3.825Q24 9.525 24 12t-.938 4.663q-.937 2.187-2.574 3.825q-1.638 1.637-3.825 2.574Q14.475 24 12 24Zm0-2q1.8 0 3.375-.575T18.25 19.8q-.825-.925-2.425-1.612q-1.6-.688-3.825-.688t-3.825.688q-1.6.687-2.425 1.612q1.3 1.05 2.875 1.625T12 22Zm-7.7-3.6q1.2-1.3 3.225-2.1q2.025-.8 4.475-.8q2.45 0 4.463.8q2.012.8 3.212 2.1q1.1-1.325 1.713-2.95Q22 13.825 22 12q0-2.075-.788-3.887q-.787-1.813-2.15-3.175q-1.362-1.363-3.175-2.151Q14.075 2 12 2q-2.05 0-3.875.787q-1.825.788-3.187 2.151Q3.575 6.3 2.788 8.113Q2 9.925 2 12q0 1.825.6 3.463q.6 1.637 1.7 2.937Z"
              />
            </svg>
          </div>
        </div>

        <div className="action-circle" onClick={() => goVia("bonus")}>
          <div className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 6H6c-.932 0-1.398 0-1.766.152a2 2 0 0 0-1.082 1.083C3 7.602 3 8.068 3 9a3 3 0 1 1 0 6c0 .932 0 1.398.152 1.765a2 2 0 0 0 1.082 1.083C4.602 18 5.068 18 6 18h8m0-12h4c.932 0 1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C21 7.602 21 8.068 21 9a3 3 0 1 0 0 6c0 .932 0 1.398-.152 1.765a2 2 0 0 1-1.083 1.083C19.398 18 18.932 18 18 18h-4m0-12v12"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="actions-floating-grid-">
        <div className="action-circle" onClick={() => setIsOpen(true)}>
          <div className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M14 13h5v-2h-5zm0-3h5V8h-5zm-9 6h8v-.55q0-1.125-1.1-1.787T9 13t-2.9.663T5 15.45zm4-4q.825 0 1.413-.587T11 10t-.587-1.412T9 8t-1.412.588T7 10t.588 1.413T9 12m-5 8q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm0-2h16V6H4zm0 0V6z"
              />
            </svg>
          </div>
        </div>

        <div className="action-circle x-primary" onClick={() => goVia("battlepass")}>
          <div className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M9.725 14L12 12.625L14.275 14l-.6-2.6l2-1.725l-2.625-.225L12 7l-1.05 2.45l-2.625.225l2 1.725zM5 21V5q0-.825.588-1.412T7 3h10q.825 0 1.413.588T19 5v16l-7-3zm2-3.05l5-2.15l5 2.15V5H7zM7 5h10z"
              />
            </svg>
          </div>
        </div>

        <div className="action-circle" onClick={() => goVia("card")}>
          <div className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 32 32"
            >
              <path
                fill="currentColor"
                d="M28 10h-6V6a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V12a2 2 0 0 0-2-2M12 6h8v4h-8ZM4 26V12h24v14Z"
              />
            </svg>
          </div>
        </div>

        <div className="action-circle" onClick={() => goVia("ads")}>
          <div className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M19 7c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2v2h-4v2h4c1.1 0 2-.9 2-2v-2c0-1.1-.9-2-2-2h-2V9h4V7zM9 7v10h4c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm2 2h2v6h-2zM3 7c-1.1 0-2 .9-2 2v8h2v-4h2v4h2V9c0-1.1-.9-2-2-2zm0 2h2v2H3z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="actions-floating-grid-">
        <div className="action-circle" onClick={() => goVia("trade")}>
          <div className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
            >
              <g
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              >
                <path d="M20 13V8h-5" />
                <path d="m20 8l-5 5c-.883.883-1.324 1.324-1.865 1.373q-.135.012-.27 0c-.541-.05-.982-.49-1.865-1.373s-1.324-1.324-1.865-1.373a1.5 1.5 0 0 0-.27 0c-.541.05-.982.49-1.865 1.373l-3 3" />
              </g>
            </svg>
          </div>
        </div>

        <div className="action-circle" onClick={() => goVia("setting")}>
          <div className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M10.825 22q-.675 0-1.162-.45t-.588-1.1L8.85 18.8q-.325-.125-.612-.3t-.563-.375l-1.55.65q-.625.275-1.25.05t-.975-.8l-1.175-2.05q-.35-.575-.2-1.225t.675-1.075l1.325-1Q4.5 12.5 4.5 12.337v-.675q0-.162.025-.337l-1.325-1Q2.675 9.9 2.525 9.25t.2-1.225L3.9 5.975q.35-.575.975-.8t1.25.05l1.55.65q.275-.2.575-.375t.6-.3l.225-1.65q.1-.65.588-1.1T10.825 2h2.35q.675 0 1.163.45t.587 1.1l.225 1.65q.325.125.613.3t.562.375l1.55-.65q.625-.275 1.25-.05t.975.8l1.175 2.05q.35.575.2 1.225t-.675 1.075l-1.325 1q.025.175.025.338v.674q0 .163-.05.338l1.325 1q.525.425.675 1.075t-.2 1.225l-1.2 2.05q-.35.575-.975.8t-1.25-.05l-1.5-.65q-.275.2-.575.375t-.6.3l-.225 1.65q-.1.65-.587 1.1t-1.163.45zM11 20h1.975l.35-2.65q.775-.2 1.438-.587t1.212-.938l2.475 1.025l.975-1.7l-2.15-1.625q.125-.35.175-.737T17.5 12t-.05-.787t-.175-.738l2.15-1.625l-.975-1.7l-2.475 1.05q-.55-.575-1.212-.962t-1.438-.588L13 4h-1.975l-.35 2.65q-.775.2-1.437.588t-1.213.937L5.55 7.15l-.975 1.7l2.15 1.6q-.125.375-.175.75t-.05.8q0 .4.05.775t.175.75l-2.15 1.625l.975 1.7l2.475-1.05q.55.575 1.213.963t1.437.587zm1.05-4.5q1.45 0 2.475-1.025T15.55 12t-1.025-2.475T12.05 8.5q-1.475 0-2.487 1.025T8.55 12t1.013 2.475T12.05 15.5M12 12"
              />
            </svg>
          </div>
        </div>

        <div className="action-circle" onClick={() => goVia("prime")}>
          <div className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="m5.825 21l1.625-7.025L2 9.25l7.2-.625L12 2l2.8 6.625l7.2.625l-5.45 4.725L18.175 21L12 17.275z"
              />
            </svg>
          </div>
        </div>

        <div className="action-circle" onClick={() => goVia("promocode")}>
          <div className="icon" >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
            >
              <g fill="none">
                <path d="m12 22l-8.66-5V7L12 2l8.66 5v10z" />
                <path
                  d="M20.66 12.006L16.34 14.5v4.995L20.66 17zM16.33 4.5L12 2L7.67 4.5L12 7zM7.66 19.495V14.5l-4.32-2.494V17z"
                  clipRule="evenodd"
                />
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                  d="m12 12l8.66-5M12 12v10m0-10L3.34 7m17.32 0L12 2L3.34 7m17.32 0v10L12 22m0 0l-8.66-5V7m17.32 5.006L16.34 14.5v4.995L20.66 17zM12 2l4.33 2.5L12 7L7.67 4.5zM3.34 17v-4.994L7.66 14.5v4.995z"
                />
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div className="controlCenterPremium">
        {/* EMBLEM CTA */}
        <section className="signaturePreviewCard">
          <div className="signatureGlow"></div>

          <div className="signatureContent">
            <span className="ccEyebrow">THE XWALLET SIGNATURE</span>

            <h2>
              There is more
              <br />
              Behind the wallet.
            </h2>

            <p>Explore the symbol that defines the xwallet universe.</p>

            <button className="signatureButton" onClick={() => goVia("emblem")}>
              <span>View the emblem</span>
              <b></b>
            </button>
          </div>

          <div className="signatureOrbital orbitalOne"></div>
          <div className="signatureOrbital orbitalTwo"></div>
        </section>

        {/* NEWS ISLAND */}
        <section className="newsIsland">
          <div className="newsScroller">
            <article className="newsCard newsCardMain">
              <span className="newsTag">UPDATE</span>
              <h4>Something new is coming to xwallet.</h4>
              <p>Discover the latest updates and improvements.</p>
              <span className="newsDate">Today · 2 min read</span>
            </article>

            <article className="newsCard">
              <span className="newsTag">PRODUCT</span>
              <h4>A better way to manage your wallet.</h4>
              <p>Built around your everyday flow.</p>
              <span className="newsDate">Yesterday</span>
            </article>

            <article className="newsCard">
              <span className="newsTag">COMMUNITY</span>
              <h4>The next chapter starts here.</h4>
              <p>See what is happening inside xwallet.</p>
              <span className="newsDate">2 days ago</span>
            </article>
          </div>
        </section>
      </div>



      <div className={"bo-overlay" + (isOpen ? " open" : "")}>
        <div className="bo-backdrop" onClick={() => setIsOpen(false)}></div>

        <div className={"bo-ticket" + (isOpen ? " open" : "")}>
          <div className="bo-ticket-inner">
            <div className="bo-header">
              <div className="bo-col">
                <span className="bo-status"></span>
              </div>
            </div>

            <div className="bo-main-balance">
              <span className="bo-bal-label">TOTAL BALANCE</span>
              <span className="bo-bal-val">
                {Number(balanceStr).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="bo-divider"></div>

            <div className="bo-row">
              <div className="bo-col">
                <span className="bo-label">24H PROFIT</span>
                <span className="bo-val-bold">{stats.profit24hStr}</span>
              </div>
              <div className="bo-col right">
                <span className="bo-label">7D PROFIT</span>
                <span className="bo-val-bold">{stats.profit7dStr}</span>
              </div>
            </div>

            <div className="bo-divider"></div>

            <div className="bo-stats-list">
              <div className="bo-stat-item">
                <span className="bo-s-label">Total Income</span>
                <span className="bo-s-dots"></span>
                <span className="bo-s-val">
                  {"$ " + stats.totalIncome.toLocaleString()}
                </span>
              </div>
              <div className="bo-stat-item">
                <span className="bo-s-label">Total Outcome</span>
                <span className="bo-s-dots"></span>
                <span className="bo-s-val">
                  {"$ " + stats.totalOutcome.toLocaleString()}
                </span>
              </div>
              <div className="bo-stat-item">
                <span className="bo-s-label">Active Trades</span>
                <span className="bo-s-dots"></span>
                <span className="bo-s-val">{stats.activeTrades + " Open"}</span>
              </div>
              <div className="bo-stat-item">
                <span className="bo-s-label">Average Win Rate</span>
                <span className="bo-s-dots"></span>
                <span className="bo-s-val">{stats.winRate + "%"}</span>
              </div>
              <div className="bo-stat-item">
                <span className="bo-s-label">Cashback Earned</span>
                <span className="bo-s-dots"></span>
                <span className="bo-s-val">
                  {"$ " + stats.cashbackEarned.toFixed(2)}
                </span>
              </div>
            </div>

            <button className="bo-settings-btn" onClick={() => goVia("setting")}>
              <span className="set-text">SYSTEM PREFERENCES</span>
            </button>
          </div>

          <div className="bo-ticket-stub">
            <span className="stub-text">{"ID " + (profile?.id ?? "—")}</span>
            <div className="stub-barcode"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeLend;