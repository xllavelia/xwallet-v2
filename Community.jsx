import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "./apiClient";
import { usePlayerProfile } from "./usePlayerProfile";
import { ProfileIcon, ProfileAvatar, StatusEmblem, ProfileModal, QRSheet, ScannerSheet, themeStyle, usd } from "./ProfileShared";
import { IconBack } from "./marketsShared";

// Ссылка на Telegram-канал Xavero: вставьте адрес сюда, блок обновится сам.
const XAVERO_CHANNEL_URL = "https://t.me/xavero_news";

const FRIEND_STATES = new Set(["self", "none", "incoming", "outgoing", "friend"]);
const FRIEND_ACTIONS = new Set(["request", "accept", "decline", "cancel", "remove"]);

const playerIdOf = (value) => (/^\d{6}$/.test(String(value ?? "")) ? String(value) : null);
const finite = (value) => {
  if ((typeof value !== "number" && typeof value !== "string") || String(value).trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};
const count = (value) => {
  const number = finite(value);
  return number !== null && number >= 0 ? number.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—";
};
const money = (value) => (finite(value) === null ? "—" : usd(value));
const percent = (value) => (finite(value) === null ? "—" : finite(value).toLocaleString("en-US", { maximumFractionDigits: 2 }) + "%");
const errorMessage = (error, fallback) => (typeof error?.message === "string" && error.message ? error.message : fallback);
const profileName = (profile) => profile.username || "Player " + profile.playerId;
const publishedDate = (value) => {
  if (!value || typeof value !== "string") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

function readProfiles(value) {
  if (!Array.isArray(value) || value.some((profile) => !profile || !playerIdOf(profile.playerId))) {
    throw new Error("The player list could not be read. Please retry.");
  }
  return value;
}

function readCommunity(value) {
  if (!value || !Array.isArray(value.news) || value.news.some((story) => !story || story.id == null || typeof story.title !== "string")) {
    throw new Error("Community returned an incomplete response. Please retry.");
  }
  return {
    ...value,
    friends: readProfiles(value.friends),
    incoming: readProfiles(value.incoming),
    outgoing: readProfiles(value.outgoing),
    leaderboard: readProfiles(value.leaderboard),
  };
}

function readReferral(value) {
  const rate = finite(value?.commissionPercent);
  if (!value || typeof value.referralCode !== "string" || !value.referralCode.trim() || typeof value.levelName !== "string" || rate === null || rate < 1 || rate > 10) {
    throw new Error("Your partner details could not be read. Please retry.");
  }
  return value;
}

// Устаревший ответ не должен заменять более свежие данные.
function useRemoteResource(path, read) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const alive = useRef(false);
  const controller = useRef(null);
  const sequence = useRef(0);
  const refresh = useCallback(async () => {
    if (!alive.current) return null;
    controller.current?.abort();
    const request = ++sequence.current;
    const nextController = new AbortController();
    controller.current = nextController;
    setState((previous) => ({ ...previous, loading: true, error: "" }));
    try {
      const value = read(await authFetch(path, { signal: nextController.signal }));
      if (!alive.current || nextController.signal.aborted || request !== sequence.current) return null;
      setState({ data: value, loading: false, error: "" });
      return value;
    } catch (error) {
      if (alive.current && !nextController.signal.aborted && request === sequence.current) {
        setState((previous) => ({ ...previous, loading: false, error: errorMessage(error, "Could not load this information.") }));
      }
      return null;
    } finally {
      if (controller.current === nextController) controller.current = null;
    }
  }, [path, read]);
  useEffect(() => {
    alive.current = true;
    void refresh();
    return () => {
      alive.current = false;
      sequence.current += 1;
      controller.current?.abort();
    };
  }, [refresh]);
  return { ...state, refresh };
}

function usePlayerSearch(query, ownId, revision) {
  const text = query.trim();
  const key = JSON.stringify([text, ownId, revision]);
  const valid = text.length >= 2 && text.length <= 32;
  const [state, setState] = useState({ key: "", data: null, loading: false, error: "" });
  useEffect(() => {
    if (!valid) {
      setState({ key, data: null, loading: false, error: "" });
      return;
    }
    const controller = new AbortController();
    let active = true;
    setState({ key, data: null, loading: true, error: "" });
    const timer = window.setTimeout(async () => {
      try {
        const profiles = readProfiles(await authFetch("/community/search?q=" + encodeURIComponent(text), { signal: controller.signal }));
        if (active && !controller.signal.aborted) {
          setState({
            key,
            data: profiles.filter((profile) => playerIdOf(profile.playerId) !== ownId && profile.friendState !== "self").slice(0, 20),
            loading: false,
            error: "",
          });
        }
      } catch (error) {
        if (active && !controller.signal.aborted) {
          setState({ key, data: null, loading: false, error: errorMessage(error, "Could not search for players.") });
        }
      }
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [valid, text, key, ownId]);
  if (!valid) return { data: null, loading: false, error: "" };
  return state.key === key ? state : { data: null, loading: true, error: "" };
}

function Notice({ title, error, onRetry, busy = false }) {
  return (
    <div className="cm-error" role="alert">
      <div>
        <strong>{title}</strong>
        <p>{error}</p>
      </div>
      {onRetry ? (
        <button type="button" className="cm-mini" onClick={onRetry} disabled={busy}>
          <ProfileIcon name="reset" />
          {busy ? "Retrying…" : "Retry"}
        </button>
      ) : null}
    </div>
  );
}

function ArticleSheet({ story, onClose }) {
  const text = typeof story.body === "string" && story.body.trim() ? story.body : (typeof story.summary === "string" ? story.summary : "");
  const date = publishedDate(story.publishedAt);
  return (
    <ProfileModal title={story.title} onClose={onClose} className="cm-article">
      <div className="cm-article-meta">
        <span>{story.category || "News"}</span>
        {date ? <time dateTime={date.toISOString()}>{date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time> : null}
      </div>
      {text.trim() ? (
        text
          .split(/\r?\n\s*\r?\n/)
          .map((paragraph, index) => <p key={index}>{paragraph}</p>)
      ) : (
        <p>No article text was provided.</p>
      )}
    </ProfileModal>
  );
}

function LeadersSheet({ leaders, loading, error, onRetry, onOpen, onClose }) {
  return (
    <ProfileModal title="Leaders" onClose={onClose} className="cm-leaders">
      <p className="cm-sheet-note">Top 20 public balances in the main wallet.</p>
      {error ? <Notice title="Could not load leaders" error={error} onRetry={onRetry} busy={loading} /> : null}
      {loading && !leaders.length ? <p className="cm-loading">Loading leaders…</p> : null}
      {leaders.length ? (
        <ol className="cm-places">
          {leaders.slice(0, 20).map((profile, index) => (
            <li key={profile.playerId}>
              <button type="button" className="cm-place-row" onClick={() => onOpen(profile.playerId)}>
                <span className={"cm-place" + (index < 3 ? " top" : "")}>{index + 1}</span>
                <ProfileAvatar profile={profile} className="cm-row-avatar" />
                <span className="cm-row-name" style={themeStyle(profile.themeId)}>
                  <strong>
                    {profileName(profile)}
                    <StatusEmblem id={profile.emblemId || "emblem-none"} />
                  </strong>
                  <small>Player {profile.playerId}</small>
                </span>
                <span className="cm-place-balance">
                  {money(profile.balance)}
                  <small>USD</small>
                </span>
              </button>
            </li>
          ))}
        </ol>
      ) : !loading && !error ? (
        <p className="cm-empty-note">Public balances will appear here.</p>
      ) : null}
    </ProfileModal>
  );
}

// Тот же реферальный экран, но уменьшенный внутри центрированного оверлея.
function ReferralSheet({ onClose }) {
  const referral = useRemoteResource("/referral", readReferral);
  const [copied, setCopied] = useState(false);
  const data = referral.data;
  const copy = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.referralCode);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  const xp = finite(data?.refXpIntoLevel);
  const required = finite(data?.refXpForLevel);
  const maxLevel = data?.isMaxLevel === true;
  const progress = maxLevel ? 100 : xp !== null && required !== null && required > 0 ? Math.min(100, Math.max(0, (xp / required) * 100)) : 0;
  return (
    <ProfileModal title="Referral program" onClose={onClose} className="cm-referral">
      {referral.error ? (
        <Notice
          title={data ? "Could not refresh partner details" : "Could not load partner details"}
          error={referral.error}
          onRetry={() => void referral.refresh()}
          busy={referral.loading}
        />
      ) : null}
      {referral.loading && !data ? <p className="cm-loading">Loading your partner details…</p> : null}
      {data ? (
        <div className="cm-ref">
          <div className="partner-card">
            <div className="pc-main">
              <div className="pc-top">
                <div className="pc-label-group">
                  <span className="pc-label">Membership tier</span>
                  <span className="pc-tier">{data.levelName.toUpperCase()}</span>
                </div>
                <div className="pc-rate-box">
                  <span className="pc-rate-val">{data.commissionPercent + "%"}</span>
                  <span className="pc-rate-label">Commission</span>
                </div>
              </div>
              <div className="pc-center">
                <span className="pc-label">Your referral code</span>
                <div className="pc-code-display">
                  <span className="pc-code">{data.referralCode}</span>
                  <button className="pc-copy-btn" onClick={copy}>
                    {copied ? "COPIED" : "COPY"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rlp-progress-card">
            <div className="rlp-progress-top">
              <div className="rlp-progress-level">
                <span className="rlp-progress-num">{"LVL " + (finite(data.level) ?? "—")}</span>
                <span className="rlp-progress-name">{data.levelName}</span>
              </div>
              {maxLevel ? (
                <span className="rlp-progress-max">Max level</span>
              ) : (
                <span className="rlp-progress-xp">{count(xp) + " / " + count(required) + " XP"}</span>
              )}
            </div>
            <div className="rlp-progress-bar">
              <div className="rlp-progress-bar-fill" style={{ width: progress + "%" }} />
            </div>
            {!maxLevel && data.nextLevelName ? (
              <div className="rlp-progress-next">
                {"Next: " + data.nextLevelName + (finite(data.nextLevelRate) !== null ? " (" + data.nextLevelRate + "% commission)" : "")}
              </div>
            ) : null}
          </div>

          <div className="ref-details">
            <div className="details-group">
              <h3 className="group-title">Network growth</h3>
              <div className="stats-list">
                <div className="stats-item">
                  <span className="s-label">Friends invited</span>
                  <span className="s-dots" />
                  <span className="s-value">{count(data.friendsInvited) + " users"}</span>
                </div>
                <div className="stats-item">
                  <span className="s-label">Active traders</span>
                  <span className="s-dots" />
                  <span className="s-value">{count(data.activeTraders) + " active"}</span>
                </div>
                <div className="stats-item">
                  <span className="s-label">Conversion rate</span>
                  <span className="s-dots" />
                  <span className="s-value">{percent(data.conversionRate)}</span>
                </div>
              </div>
            </div>

            <div className="details-group">
              <h3 className="group-title">Trading volume</h3>
              <div className="stats-list">
                <div className="stats-item">
                  <span className="s-label">Friends turnover</span>
                  <span className="s-dots" />
                  <span className="s-value">{money(data.totalReferredVolume)}</span>
                </div>
                <div className="stats-item">
                  <span className="s-label">{"Your share (" + data.commissionPercent + "%)"}</span>
                  <span className="s-dots" />
                  <span className="s-value">{money(data.totalEarned)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </ProfileModal>
  );
}

function FriendControls({ profile, busy, disabled, onAction }) {
  const id = playerIdOf(profile.playerId);
  const state = profile.friendState;
  const working = busy?.playerId === id;
  if (state === "self") return null;
  if (state === "friend") {
    return (
      <span className="cm-friend-tag">
        <ProfileIcon name="check" />
        Friends
      </span>
    );
  }
  if (state === "outgoing") {
    return (
      <button type="button" className="cm-mini" disabled={disabled} onClick={() => onAction(id, "cancel")}>
        {working ? "Working…" : "Cancel"}
      </button>
    );
  }
  if (state === "incoming") {
    return (
      <span className="cm-row-actions">
        <button type="button" className="cm-mini cm-mini-solid" disabled={disabled} onClick={() => onAction(id, "accept")}>
          {working ? "Working…" : "Accept"}
        </button>
        <button type="button" className="cm-mini" disabled={disabled} onClick={() => onAction(id, "decline")}>
          Decline
        </button>
      </span>
    );
  }
  return (
    <button type="button" className="cm-mini cm-mini-solid" disabled={disabled} onClick={() => onAction(id, "request")}>
      <ProfileIcon name="add" />
      {working ? "Sending…" : "Add friend"}
    </button>
  );
}

function PlayerRow({ profile, busy, disabled, onOpen, onAction }) {
  return (
    <li className="cm-row">
      <button type="button" className="cm-row-main" onClick={() => onOpen(profile.playerId)}>
        <ProfileAvatar profile={profile} className="cm-row-avatar" />
        <span className="cm-row-name" style={themeStyle(profile.themeId)}>
          <strong>
            {profileName(profile)}
            <StatusEmblem id={profile.emblemId || "emblem-none"} />
          </strong>
          <small>Player {profile.playerId}</small>
        </span>
      </button>
      <FriendControls profile={profile} busy={busy} disabled={disabled} onAction={onAction} />
    </li>
  );
}

export default function Community() {
  const navigate = useNavigate();
  const uid = useId();
  const own = usePlayerProfile();
  const community = useRemoteResource("/community", readCommunity);
  const [overlay, setOverlay] = useState(null);
  const [query, setQuery] = useState("");
  const [searchRevision, setSearchRevision] = useState(0);
  const [busy, setBusy] = useState(null);
  const [friendError, setFriendError] = useState("");
  const [friendNotice, setFriendNotice] = useState("");
  const alive = useRef(false);
  const mutationLock = useRef(false);
  const mutationController = useRef(null);
  const searchInput = useRef(null);
  const searchSection = useRef(null);

  const ownProfile = own.data?.profile;
  const ownId = playerIdOf(ownProfile?.playerId);
  const search = usePlayerSearch(query, ownId, searchRevision);
  const data = community.data;

  const news = useMemo(
    () =>
      (data?.news || [])
        .filter((story) => story.isPublished !== false)
        .slice()
        .sort((a, b) => (publishedDate(b.publishedAt)?.getTime() || 0) - (publishedDate(a.publishedAt)?.getTime() || 0)),
    [data?.news],
  );
  const leaders = useMemo(
    () =>
      (data?.leaderboard || [])
        .filter((profile) => !profile.isAdmin && profile.showBalance === true && finite(profile.balance) !== null)
        .slice()
        .sort((a, b) => finite(b.balance) - finite(a.balance)),
    [data?.leaderboard],
  );
  const friends = data?.friends || [];
  const incoming = data?.incoming || [];
  const actionsDisabled = !!busy || community.loading || !!community.error;

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      mutationController.current?.abort();
    };
  }, []);

  useEffect(() => {
    const refresh = () => {
      if (!mutationLock.current) void community.refresh();
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("xw-profile-changed", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("xw-profile-changed", refresh);
    };
  }, [community.refresh]);

  const closeOverlay = useCallback(() => setOverlay(null), []);
  const openProfile = useCallback(
    (value) => {
      const id = playerIdOf(value);
      if (!id) return;
      setOverlay(null);
      navigate("/profile?playerId=" + encodeURIComponent(id));
    },
    [navigate],
  );

  const findFriends = () => {
    searchSection.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    searchInput.current?.focus();
  };

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  const openChannel = () => {
    if (!XAVERO_CHANNEL_URL) setFriendNotice("The Xavero channel link will appear here soon.");
  };

  const changeFriend = async (value, action) => {
    const id = playerIdOf(value);
    if (!id || !FRIEND_ACTIONS.has(action) || mutationLock.current || actionsDisabled) return;
    mutationLock.current = true;
    setBusy({ playerId: id, action });
    setFriendError("");
    setFriendNotice("");
    const controller = new AbortController();
    mutationController.current = controller;
    try {
      const result = await authFetch("/community/friend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: id, action }),
        signal: controller.signal,
      });
      if (!alive.current || controller.signal.aborted) return;
      if (!FRIEND_STATES.has(result?.friendState)) {
        await community.refresh();
        if (!alive.current || controller.signal.aborted) return;
        setSearchRevision((previous) => previous + 1);
        throw new Error("The server response was incomplete. The friend list has been refreshed; check it before trying again.");
      }
      setSearchRevision((previous) => previous + 1);
      const updated = await community.refresh();
      if (!alive.current || controller.signal.aborted) return;
      const message =
        result.friendState === "friend"
          ? "Friend connection confirmed."
          : result.friendState === "incoming"
            ? "This player has sent you a friend request."
            : result.friendState === "outgoing"
              ? "Friend request sent."
              : action === "decline"
                ? "Friend request declined."
                : action === "cancel"
                  ? "Friend request canceled."
                  : action === "remove"
                    ? "Friend removed."
                    : "Friend connection updated.";
      setFriendNotice(updated ? message : message + " Refresh failed; retry to see the latest list.");
    } catch (error) {
      if (alive.current && !controller.signal.aborted) setFriendError(errorMessage(error, "Could not update this friend connection."));
    } finally {
      mutationLock.current = false;
      if (mutationController.current === controller) mutationController.current = null;
      if (alive.current) setBusy(null);
    }
  };

  const channelClass = "cm-channel" + (XAVERO_CHANNEL_URL ? "" : " is-idle");

  return (
    <main className="cm-page" aria-labelledby={uid + "-title"}>
      <header className="cm-top">
        <button type="button" className="pf-round" onClick={goBack} aria-label="Go back">
          <IconBack />
        </button>
        <h1 id={uid + "-title"}>Community</h1>
        <button
          type="button"
          className="pf-round cm-avatar-button"
          onClick={() => navigate("/profile")}
          aria-label="Open your profile"
        >
          {ownProfile ? <ProfileAvatar profile={ownProfile} /> : <ProfileIcon name="people" />}
        </button>
      </header>

      <div className="cm-body">
        {own.error ? <Notice title="Could not load your profile" error={own.error} onRetry={() => void own.refresh()} busy={own.loading} /> : null}
        {community.error ? (
          <Notice
            title={data ? "Could not refresh Community" : "Could not load Community"}
            error={community.error}
            onRetry={() => void community.refresh()}
            busy={community.loading}
          />
        ) : null}
        {friendError ? <Notice title="Friend update failed" error={friendError} /> : null}
        {friendNotice ? (
          <p className="cm-notice" role="status">
            {friendNotice}
          </p>
        ) : null}
        {community.loading && !data ? <p className="cm-loading">Loading Community…</p> : null}

        <a
          className={channelClass}
          href={XAVERO_CHANNEL_URL || undefined}
          target={XAVERO_CHANNEL_URL ? "_blank" : undefined}
          rel={XAVERO_CHANNEL_URL ? "noopener noreferrer" : undefined}
          onClick={(event) => {
            if (!XAVERO_CHANNEL_URL) {
              event.preventDefault();
              openChannel();
            }
          }}
          aria-label="Xavero Telegram channel"
        >
          <span className="cm-channel-art" aria-hidden="true">
            <ProfileIcon name="send" />
          </span>
          <span className="cm-channel-copy">
            <span className="cm-channel-label">Telegram</span>
            <strong>Xavero channel</strong>
            <small>Market updates, launches and community news.</small>
          </span>
          <ProfileIcon name="chevron" className="pf-chevron" />
        </a>

        <section className="cm-section" aria-labelledby={uid + "-news"}>
          <div className="cm-head">
            <h2 id={uid + "-news"}>News</h2>
            {news.length ? <span className="cm-badge">{news.length}</span> : null}
          </div>
          {news.length ? (
            <div className="cm-swipe">
              {news.map((story) => {
                const date = publishedDate(story.publishedAt);
                return (
                  <button
                    type="button"
                    key={story.id}
                    className="cm-story"
                    onClick={() => setOverlay({ type: "article", story })}
                    aria-label={"Read story: " + story.title}
                  >
                    <span className="cm-story-top">
                      <span className="cm-badge">{story.category || "News"}</span>
                      {date ? (
                        <time dateTime={date.toISOString()}>
                          {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </time>
                      ) : null}
                    </span>
                    <strong>{story.title}</strong>
                    {story.summary ? <span className="cm-story-text">{story.summary}</span> : null}
                    <span className="cm-story-more">
                      Read
                      <ProfileIcon name="arrow" />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="cm-empty-note">Published stories will appear here.</p>
          )}
        </section>

        <div className="cm-actions">
          <button type="button" className="cm-action" onClick={() => setOverlay({ type: "leaders" })}>
            <span className="cm-action-icon">
              <ProfileIcon name="trophy" />
            </span>
            <strong>Leaders</strong>
            <small>Top 20 by balance</small>
          </button>
          <button type="button" className="cm-action cm-action-accent" onClick={() => setOverlay({ type: "referral" })}>
            <span className="cm-action-icon">
              <ProfileIcon name="gift" />
            </span>
            <strong>Referral program</strong>
            <small>Earn up to 10% of fees</small>
          </button>
        </div>

        <section className="cm-section" ref={searchSection} aria-labelledby={uid + "-find"}>
          <div className="cm-head">
            <h2 id={uid + "-find"}>Find players</h2>
            <button type="button" className="cm-mini" onClick={() => setOverlay({ type: "scanner" })}>
              <ProfileIcon name="scan" />
              Scan code
            </button>
          </div>
          <form
            className="cm-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              if (query.trim().length >= 2) setSearchRevision((value) => value + 1);
            }}
          >
            <ProfileIcon name="search" />
            <input
              ref={searchInput}
              value={query}
              maxLength={32}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="Name or six-digit ID"
              aria-label="Search players by name or player ID"
              onChange={(event) => setQuery(event.target.value)}
            />
            {query ? (
              <button
                type="button"
                className="cm-clear"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  searchInput.current?.focus();
                }}
              >
                <ProfileIcon name="close" />
              </button>
            ) : null}
          </form>
          {search.loading ? <p className="cm-loading">Searching players…</p> : null}
          {search.error ? (
            <Notice title="Player search failed" error={search.error} onRetry={() => setSearchRevision((value) => value + 1)} />
          ) : null}
          {search.data && !search.loading && !search.error ? (
            search.data.length ? (
              <ul className="cm-rows">
                {search.data.map((profile) => (
                  <PlayerRow
                    key={profile.playerId}
                    profile={profile}
                    busy={busy}
                    disabled={actionsDisabled}
                    onOpen={openProfile}
                    onAction={changeFriend}
                  />
                ))}
              </ul>
            ) : (
              <p className="cm-empty-note">No matching players. Try another name or player ID.</p>
            )
          ) : null}
        </section>

        <section className="cm-section" aria-labelledby={uid + "-friends"}>
          <div className="cm-head">
            <h2 id={uid + "-friends"}>Your friends</h2>
            {friends.length ? <span className="cm-badge">{friends.length}</span> : null}
            <button type="button" className="cm-mini" onClick={findFriends}>
              <ProfileIcon name="add" />
              Add
            </button>
          </div>
          {friends.length ? (
            <div className="cm-friends">
              {friends.map((profile) => (
                <button
                  type="button"
                  key={profile.playerId}
                  className="cm-friend"
                  onClick={() => openProfile(profile.playerId)}
                  aria-label={"Open " + profileName(profile) + "'s profile"}
                >
                  <ProfileAvatar profile={profile} />
                  <span>{profileName(profile)}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="cm-empty">
              <span className="cm-empty-icon">
                <ProfileIcon name="people" />
              </span>
              <strong>Your circle starts here</strong>
              <p>Find a player by name, ID or QR code and send a friend request.</p>
              <button type="button" className="cm-mini cm-mini-solid" onClick={findFriends}>
                Find friends
              </button>
            </div>
          )}
          {incoming.length ? (
            <div className="cm-requests">
              <p className="cm-subtitle">
                Friend requests
                <span className="cm-badge">{incoming.length}</span>
              </p>
              <ul className="cm-rows">
                {incoming.map((profile) => (
                  <PlayerRow
                    key={profile.playerId}
                    profile={{ ...profile, friendState: "incoming" }}
                    busy={busy}
                    disabled={actionsDisabled}
                    onOpen={openProfile}
                    onAction={changeFriend}
                  />
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <div className="cm-code-card">
          <span className="cm-action-icon">
            <ProfileIcon name="qr" />
          </span>
          <span className="cm-channel-copy">
            <strong>Your player code</strong>
            <small>Let friends scan it to open your profile.</small>
          </span>
          <span className="cm-row-actions">
            <button type="button" className="cm-mini" onClick={() => setOverlay({ type: "scanner" })}>
              Scan
            </button>
            <button
              type="button"
              className="cm-mini cm-mini-solid"
              disabled={!ownProfile}
              onClick={() => setOverlay({ type: "qr" })}
            >
              Show
            </button>
          </span>
        </div>
      </div>

      {overlay?.type === "article" ? <ArticleSheet story={overlay.story} onClose={closeOverlay} /> : null}
      {overlay?.type === "leaders" ? (
        <LeadersSheet
          leaders={leaders}
          loading={community.loading}
          error={community.error}
          onRetry={() => void community.refresh()}
          onOpen={openProfile}
          onClose={closeOverlay}
        />
      ) : null}
      {overlay?.type === "referral" ? <ReferralSheet onClose={closeOverlay} /> : null}
      {overlay?.type === "scanner" ? (
        <ScannerSheet
          onClose={closeOverlay}
          onFound={(id) => {
            closeOverlay();
            openProfile(id);
          }}
        />
      ) : null}
      {overlay?.type === "qr" && ownProfile ? <QRSheet profile={ownProfile} onClose={closeOverlay} /> : null}
    </main>
  );
}
