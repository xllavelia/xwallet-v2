import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authFetch } from "./apiClient";
import { changePassword, deleteAccount } from "./useAccount";
import { prepareAvatar, usePlayerProfile } from "./usePlayerProfile";
import { MenuRow, ProfileAvatar, ProfileHero, ProfileIcon, ProfileModal, QRSheet, StatusEmblem, themeStyle, usd } from "./ProfileShared";
import { IconBack } from "./marketsShared";

const KEY_BY_KIND = { theme: "themeId", emblem: "emblemId", pattern: "patternId" };
const FRIEND_LABELS = { none: "Add friend", incoming: "Accept request", outgoing: "Request sent", friend: "Friends" };
const DEFAULT_LOOK = { themeId: "theme-graphite", emblemId: "emblem-none", patternId: "pattern-orbit" };
const VIEW_TITLES = { edit: "Edit profile", appearance: "Appearance", security: "Password & security", settings: "Settings" };
const MODAL_TITLES = { photo: "Your new photo", delete: "Delete account", logout: "Log out?", friend: "Manage friendship", "remove-photo": "Remove photo?" };

function Toggle({ checked }) {
  return (
    <span
      role="switch"
      aria-checked={checked}
      className={"pf-switch" + (checked ? " on" : "")}
    />
  );
}

function joinedLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// Откуда игрок получил косметику: цена, уровень Pass или источник.
function sourceLabel(item) {
  if (item.price) return item.price + " LAVX";
  if (item.track === "pass") return "Premium Pass · Level " + item.level;
  if (item.level) return "Free Pass · Level " + item.level;
  return item.source || "";
}

export default function Profile() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const target = params.get("playerId");

  const { data, error, refresh, mutate } = usePlayerProfile();

  const [other, setOther] = useState(null);
  const [otherError, setOtherError] = useState("");
  const [view, setView] = useState("profile");
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [appearance, setAppearance] = useState(DEFAULT_LOOK);
  const [tab, setTab] = useState("theme");
  const [photo, setPhoto] = useState("");
  const [preview, setPreview] = useState(null);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [deleteName, setDeleteName] = useState("");
  const [preferences, setPreferences] = useState(() => ({
    hidden: localStorage.getItem("xw-hide-balances") === "1",
    calm: localStorage.getItem("xw-reduce-motion") === "1",
  }));

  const fileInput = useRef(null);
  const own = !target || target === data?.profile?.playerId;

  useEffect(() => {
    if (!target || own) {
      setOther(null);
      setOtherError("");
      return;
    }
    const controller = new AbortController();
    setOther(null);
    setOtherError("");
    if (!/^\d{6}$/.test(target)) {
      setOtherError("This player ID is not valid.");
      return;
    }
    authFetch("/profile/view?playerId=" + target, { signal: controller.signal })
      .then(setOther)
      .catch((err) => {
        if (!controller.signal.aborted) setOtherError(err.message);
      });
    return () => controller.abort();
  }, [target, own]);

  useEffect(() => {
    setView("profile");
    setModal(null);
    setFailure("");
    setMessage("");
  }, [target]);

  const profile = own ? data?.profile : other;

  const run = async (action) => {
    if (busy) return;
    setBusy(true);
    setFailure("");
    setMessage("");
    try {
      await action();
    } catch (err) {
      setFailure(err.message || "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const back = () => {
    setFailure("");
    setMessage("");
    if (view === "security") {
      setView("settings");
      return;
    }
    if (view !== "profile") {
      setView("profile");
      return;
    }
    if (window.history.length > 1) navigate(-1);
    else navigate(own ? "/" : "/community");
  };

  const edit = () => {
    setName(profile.username);
    setBio(profile.bio || "");
    setFailure("");
    setMessage("");
    setView("edit");
  };

  const customize = () => {
    setAppearance({
      themeId: profile.themeId,
      emblemId: profile.emblemId,
      patternId: profile.patternId,
    });
    setFailure("");
    setMessage("");
    setView("appearance");
  };

  const openModal = (value) => {
    setModal(value);
    setFailure("");
    setMessage("");
  };

  const closeModal = () => {
    if (busy) return;
    setModal(null);
    setFailure("");
    setPhoto("");
  };

  const selectPhoto = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    run(async () => {
      setPhoto(await prepareAvatar(file));
      setModal("photo");
    });
  };

  const copyId = () =>
    run(async () => {
      await navigator.clipboard.writeText(profile.playerId);
      setMessage("Player ID copied");
    });

  const save = () =>
    run(async () => {
      const username = name.trim();
      const description = bio.trim();
      const invalid = /[\u0000-\u001f\u007f]/;
      if (username !== profile.username && ([...username].length < 3 || [...username].length > 24 || invalid.test(username))) {
        throw new Error("Name must be 3–24 characters without line breaks.");
      }
      if ([...description].length > 160 || invalid.test(description)) {
        throw new Error("Description must be under 160 characters without line breaks.");
      }
      await mutate("/profile/update", { username, bio: description, showBalance: profile.showBalance });
      setView("profile");
      setMessage("Profile updated");
    });

  const chooseCosmetic = (item) => {
    if (item.owned) {
      setAppearance((value) => ({ ...value, [KEY_BY_KIND[item.kind]]: item.id }));
      return;
    }
    setPreview(item);
    openModal("cosmetic");
  };

  const buy = () =>
    run(async () => {
      await mutate("/profile/purchase", { cosmeticId: preview.id });
      setAppearance((value) => ({ ...value, [KEY_BY_KIND[preview.kind]]: preview.id }));
      setModal(null);
      setMessage("Unlocked. Save to wear your new look.");
    });

  const setPreference = (key) => {
    const next = !preferences[key];
    const storage = key === "hidden" ? "xw-hide-balances" : "xw-reduce-motion";
    localStorage.setItem(storage, next ? "1" : "0");
    setPreferences((value) => ({ ...value, [key]: next }));
    if (key === "calm") document.documentElement.classList.toggle("xw-reduce-motion", next);
    window.dispatchEvent(new Event("xw-preferences-changed"));
  };

  const changePrivacy = () =>
    run(async () => {
      await mutate("/profile/update", {
        username: profile.username,
        bio: profile.bio || "",
        showBalance: !profile.showBalance,
      });
      setMessage(profile.showBalance ? "Balance hidden from other players" : "Public balance enabled");
    });

  const friendship = (action) =>
    run(async () => {
      const result = await authFetch("/community/friend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: profile.playerId, action }),
      });
      setOther((value) => ({ ...value, friendState: result.friendState }));
      setModal(null);
      setMessage(action === "request" ? "Friend request sent" : "Friendship updated");
    });

  const friendAction = () => {
    if (["friend", "outgoing"].includes(profile.friendState)) {
      openModal("friend");
      return;
    }
    friendship(profile.friendState === "incoming" ? "accept" : "request");
  };

  const logout = () => {
    localStorage.removeItem("xw_session");
    localStorage.removeItem("xw_token");
    window.location.assign("/");
  };

  if (!profile) {
    return (
      <main className="pf-page">
        <header className="pf-topbar">
          <button type="button" className="pf-round" onClick={back} aria-label="Go back">
            <IconBack />
          </button>
          <span className="pf-topbar-title">Profile</span>
          <span className="pf-round pf-round-ghost" />
        </header>
        <div className="pf-loading-body">
          <ProfileIcon name="people" />
          <h2>{otherError || error ? "Could not load profile" : "Loading profile…"}</h2>
          {otherError || error ? (
            <>
              <p className="pf-error">{otherError || error}</p>
              <button
                type="button"
                className="pf-secondary"
                onClick={() => (own ? refresh() : navigate("/community"))}
              >
                {own ? "Try again" : "Back to Community"}
              </button>
            </>
          ) : null}
        </div>
      </main>
    );
  }

  const catalog = data?.catalog || [];
  const look = { ...profile, ...appearance };
  const ownedCount = catalog.filter((item) => item.owned && !item.id.endsWith("-none")).length;
  const notice = (
    <>
      {failure && !modal ? (
        <p className="pf-error" role="alert">
          {failure}
        </p>
      ) : null}
      {message ? (
        <p className="pf-notice" role="status">
          {message}
        </p>
      ) : null}
    </>
  );

  return (
    <main className="pf-page">
      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="pf-hidden-input"
        onChange={selectPhoto}
        aria-label="Upload avatar"
      />

      <header className="pf-topbar">
        <button type="button" className="pf-round" onClick={back} aria-label="Go back">
          <IconBack />
        </button>
        <span className="pf-topbar-title">{view === "profile" ? "Profile" : VIEW_TITLES[view]}</span>
        {view === "profile" ? (
          <button
            type="button"
            className="pf-round"
            onClick={() => openModal("qr")}
            aria-label="Player QR code"
          >
            <ProfileIcon name="qr" />
          </button>
        ) : (
          <span className="pf-round pf-round-ghost" />
        )}
      </header>

      {view === "profile" ? (
        <>
          <ProfileHero profile={profile}>
            <div className="pf-hero-actions">
              {own ? (
                <>
                  <button type="button"  onClick={() => {
                      setFailure("");
                      setMessage("");
                      setView("settings");
                    }}>
                    <ProfileIcon name="settings" />
                    <span>{busy ? "Preparing…" : "Setting"}</span>
                  </button>
                  <button type="button" onClick={edit}>
                    <ProfileIcon name="edit" />
                    <span>Edit</span>
                  </button>
                  <button type="button" onClick={customize}>
                    <ProfileIcon name="palette" />
                    <span>Looks</span>
                  </button>
                </>
              ) : (
                <>
                  <button type="button" disabled={busy} onClick={friendAction}>
                    <ProfileIcon name={profile.friendState === "friend" ? "check" : "add"} />
                    <span>{FRIEND_LABELS[profile.friendState] || "Add friend"}</span>
                  </button>
                  <button type="button" onClick={copyId}>
                    <ProfileIcon name="copy" />
                    <span>Copy ID</span>
                  </button>
                </>
              )}
            </div>
          </ProfileHero>

          <div className="pf-body">
            {notice}

            <section className="pf-card pf-about">
              <span className="pf-label">About</span>
              <strong>{profile.bio || (own ? "A little about you" : "No description yet")}</strong>
              {own && !profile.bio ? (
                <button type="button" className="pf-text-link" onClick={edit}>
                  Add a description
                </button>
              ) : null}
            </section>

            <section className="pf-card pf-facts">
              <button type="button" className="pf-fact" onClick={copyId}>
                <span>Player ID</span>
                <strong>{profile.playerId}</strong>
                <ProfileIcon name="copy" />
              </button>
              <div className="pf-fact">
                <span>Joined</span>
                <strong>{joinedLabel(profile.createdAt)}</strong>
              </div>
              {!own && profile.showBalance && profile.balance !== undefined ? (
                <div className="pf-fact">
                  <span>Main balance</span>
                  <strong>{usd(profile.balance)}</strong>
                </div>
              ) : null}
            </section>

            {own ? (
              <>
                <section className="pf-menu">
                  <MenuRow
                    icon="edit"
                    title="Edit profile"
                    subtitle="Name, photo and description"
                    onClick={edit}
                  />
                  <MenuRow
                    icon="palette"
                    title="Appearance"
                    subtitle="Colors, emblems and background"
                    onClick={customize}
                  />
                  <MenuRow
                    icon="settings"
                    title="Settings"
                    subtitle="Account, security and preferences"
                    onClick={() => {
                      setFailure("");
                      setMessage("");
                      setView("settings");
                    }}
                  />
                </section>
                <button type="button" className="pf-banner" onClick={() => navigate("/community")}>
                  <span className="pf-banner-icon">
                    <ProfileIcon name="people" />
                  </span>
                  <span className="pf-banner-copy">
                    <strong>Community</strong>
                    <small>Friends, news and referrals</small>
                  </span>
                  <ProfileIcon name="chevron" className="pf-chevron" />
                </button>
              </>
            ) : profile.friendState === "incoming" ? (
              <button
                type="button"
                className="pf-secondary"
                disabled={busy}
                onClick={() => friendship("decline")}
              >
                Decline request
              </button>
            ) : null}
          </div>
        </>
      ) : null}

      {view === "edit" ? (
        <div className="pf-body pf-subpage">
          {notice}

          <button
            type="button"
            className="pf-photo-edit"
            onClick={() => fileInput.current.click()}
            disabled={busy}
          >
            <ProfileAvatar profile={profile} />
            <span>
              <ProfileIcon name="camera" />
              Change photo
            </span>
          </button>
          {profile.avatarUrl ? (
            <button
              type="button"
              className="pf-text-link pf-text-link-center"
              onClick={() => openModal("remove-photo")}
            >
              Remove photo
            </button>
          ) : null}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              save();
            }}
          >
            <p className="pf-label-">Your identity</p>
            <section className="pf-card pf-form">
              <label>
                Display name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={24}
                  autoComplete="nickname"
                  placeholder="Your name"
                />
              </label>
              <label>
                Description
                <textarea
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  maxLength={160}
                  rows={3}
                  placeholder="A little about you"
                />
                <small>{[...bio].length} / 160</small>
              </label>
            </section>

            <section className="pf-card pf-facts">
              <div className="pf-fact">
                <span>Player ID</span>
                <strong>{profile.playerId}</strong>
              </div>
            </section>
            <p className="pf-helper">
              Your name, photo and description are visible to other players. Your name also works when
              signing in. The player ID never changes.
            </p>
            <button type="submit" className="pf-primary" disabled={busy}>
              {busy ? "Saving…" : "Save profile"}
            </button>
          </form>
        </div>
      ) : null}

      {view === "appearance" ? (
        <>
          <ProfileHero profile={look} compact>
            <span className="pf-preview">Live preview</span>
          </ProfileHero>
          <div className="pf-body pf-subpage">
            {notice}
            <div className="pf-collection">
              <span>
                {ownedCount} / {catalog.length} collected
              </span>
              <strong>{Number(data.lavxBalance || 0).toLocaleString("en-US")} LAVX</strong>
            </div>

            <div className="pf-tabs" role="tablist" aria-label="Appearance category">
              {[
                ["theme", "Colors"],
                ["emblem", "Emblems"],
                ["pattern", "Background"],
              ].map(([key, title]) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  key={key}
                  className={tab === key ? "active" : ""}
                  onClick={() => setTab(key)}
                >
                  {title}
                </button>
              ))}
            </div>

            <section className={"pf-grid" + (tab === "theme" ? " pf-swatches" : "")}>
              {catalog
                .filter((item) => item.kind === tab && (!item.adminOnly || profile.isAdmin))
                .map((item) => {
                  const selected = appearance[KEY_BY_KIND[item.kind]] === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      className={"pf-item" + (selected ? " selected" : "") + (item.owned ? "" : " locked")}
                      aria-label={item.name + (item.owned ? " · owned" : " · locked")}
                      aria-pressed={selected}
                      onClick={() => chooseCosmetic(item)}
                    >
                      {item.kind === "theme" ? (
                        <span className={"pf-color-sample " + item.id} style={themeStyle(item.id)}>
                          <i />
                        </span>
                      ) : item.id.endsWith("-none") ? (
                        <ProfileIcon name="close" className="pf-no-emblem" />
                      ) : (
                        <StatusEmblem id={item.id} />
                      )}
                      <strong>{item.name}</strong>
                      <small>{item.owned ? item.rarity : sourceLabel(item)}</small>
                      {!item.owned ? <ProfileIcon name="lock" className="pf-item-lock" /> : null}
                      {selected ? <ProfileIcon name="check" className="pf-item-check" /> : null}
                    </button>
                  );
                })}
            </section>

            <p className="pf-helper">
              Unlock looks in Battle Pass or buy exclusives for LAVX. Team-only looks stay hidden for
              regular players.
            </p>

            <div className="pf-appearance-actions">
              <button type="button" className="pf-ghost" onClick={() => setAppearance(DEFAULT_LOOK)}>
                Reset
              </button>
              <button
                type="button"
                className="pf-primary"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await mutate("/profile/equip", appearance);
                    setView("profile");
                    setMessage("Your look is saved");
                  })
                }
              >
                {busy ? "Saving…" : "Save appearance"}
              </button>
            </div>
          </div>
        </>
      ) : null}

      {view === "settings" ? (
        <div className="pf-body pf-subpage">
          {notice}

          <section className="pf-menu">
            <MenuRow
              icon="edit"
              title="Account"
              subtitle="Name, photo and description"
              onClick={edit}
            />
            <MenuRow
              icon="palette"
              title="Appearance"
              subtitle="Colors, emblems and background"
              onClick={customize}
            />
            <MenuRow
              icon="shield"
              title="Password & security"
              subtitle="Change your password"
              onClick={() => setView("security")}
            />
          </section>

          <p className="pf-label">Privacy and comfort</p>
          <section className="pf-menu">
            <MenuRow
              icon="trophy"
              title="Public balance"
              subtitle="Show on profile and leaderboard"
              onClick={changePrivacy}
              tail={<Toggle checked={Boolean(profile.showBalance)} />}
            />
            <MenuRow
              icon="wallet"
              title="Hide balances on Home"
              onClick={() => setPreference("hidden")}
              tail={<Toggle checked={preferences.hidden} />}
            />
            <MenuRow
              icon="spark"
              title="Reduce motion"
              subtitle="A calmer experience"
              onClick={() => setPreference("calm")}
              tail={<Toggle checked={preferences.calm} />}
            />
          </section>

          <p className="pf-label">Your xwallet</p>
          <section className="pf-menu">
            {[
              ["gift", "Promo codes", "/promocode"],
              ["wallet", "My vouchers", "/bonus"],
              ["trophy", "Battle Pass", "/battlepass"],
              ["spark", "Prime membership", "/prime"],
              ["people", "Community and referrals", "/community"],
              ["chart", "Crypto", "/crypto"],
              ["globe", "Markets", "/markets"],
            ].map(([icon, title, path]) => (
              <MenuRow key={path} icon={icon} title={title} onClick={() => navigate(path)} />
            ))}
          </section>

          {profile.isAdmin ? (
            <section className="pf-menu">
              <MenuRow
                icon="shield"
                title="Admin panel"
                subtitle="System administration"
                onClick={() => navigate("/admin")}
              />
            </section>
          ) : null}

          <p className="pf-label">Account</p>
          <section className="pf-menu">
            <MenuRow icon="logout" title="Log out" onClick={() => openModal("logout")} />
            <MenuRow
              icon="trash"
              title="Delete account"
              subtitle="This cannot be undone"
              onClick={() => {
                setDeleteName("");
                openModal("delete");
              }}
            />
          </section>

          <footer className="pf-footer">xwallet · English</footer>
        </div>
      ) : null}

      {view === "security" ? (
        <div className="pf-body pf-subpage">
          {notice}
          <span className="pf-shield">
            <ProfileIcon name="shield" />
          </span>
          <h3 className="pf-security-title">Keep your account protected.</h3>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              run(async () => {
                if (passwords.next.length < 6) throw new Error("New password must be at least 6 characters.");
                if (passwords.next !== passwords.confirm) throw new Error("Passwords do not match.");
                await changePassword(passwords.current, passwords.next);
                setPasswords({ current: "", next: "", confirm: "" });
                setMessage("Password updated");
              });
            }}
          >
            <section className="pf-card pf-form">
              {[
                ["current", "Current password", "current-password"],
                ["next", "New password", "new-password"],
                ["confirm", "Confirm new password", "new-password"],
              ].map(([key, title, autoComplete]) => (
                <label key={key}>
                  {title}
                  <input
                    type="password"
                    autoComplete={autoComplete}
                    value={passwords[key]}
                    onChange={(event) =>
                      setPasswords((value) => ({ ...value, [key]: event.target.value }))
                    }
                    required
                  />
                </label>
              ))}
            </section>
            <button type="submit" className="pf-primary" disabled={busy}>
              {busy ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>
      ) : null}

      {modal === "qr" ? <QRSheet profile={profile} onClose={closeModal} /> : null}

      {modal && modal !== "qr" ? (
        <ProfileModal
          title={modal === "cosmetic" ? preview.name : MODAL_TITLES[modal]}
          onClose={closeModal}
        >
          {modal === "cosmetic" ? (
            <>
              <ProfileHero profile={{ ...look, [KEY_BY_KIND[preview.kind]]: preview.id }} compact />
              <div className="pf-item-meta">
                <span>{preview.rarity}</span>
                <strong>{sourceLabel(preview)}</strong>
              </div>
              <p className="pf-helper">
                {preview.price
                  ? "A permanent exclusive. This purchase unlocks the look for your account."
                  : "Claim this reward in Battle Pass to add it to your collection."}
              </p>
              {preview.price ? (
                <button
                  type="button"
                  className="pf-primary"
                  disabled={busy || Number(data.lavxBalance) < preview.price}
                  onClick={buy}
                >
                  {Number(data.lavxBalance) < preview.price
                    ? "Not enough LAVX"
                    : busy
                      ? "Unlocking…"
                      : "Unlock for " + preview.price + " LAVX"}
                </button>
              ) : (
                <button
                  type="button"
                  className="pf-primary"
                  onClick={() => {
                    setModal(null);
                    navigate("/battlepass");
                  }}
                >
                  Open Battle Pass
                </button>
              )}
            </>
          ) : null}

          {modal === "photo" ? (
            <>
              <img className="pf-photo-preview" src={photo} alt="New avatar preview" />
              <p className="pf-helper">
                Centered square crop · 384 × 384 · under 96 KB. Visible to other players.
              </p>
              <button
                type="button"
                className="pf-primary"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await mutate("/profile/avatar", { image: photo });
                    setModal(null);
                    setPhoto("");
                    setMessage("Photo updated");
                  })
                }
              >
                {busy ? "Uploading…" : "Use this photo"}
              </button>
            </>
          ) : null}

          {modal === "delete" ? (
            <>
              <p className="pf-helper">
                This permanently deletes your account, balances and history. Type{" "}
                <strong>{profile.username}</strong> to confirm.
              </p>
              <input
                className="pf-confirm-input"
                value={deleteName}
                onChange={(event) => setDeleteName(event.target.value)}
                placeholder="Type your name"
                aria-label="Confirm account name"
              />
              <button
                type="button"
                className="pf-danger"
                disabled={busy || deleteName.trim().toLowerCase() !== profile.username.toLowerCase()}
                onClick={() =>
                  run(async () => {
                    await deleteAccount();
                    logout();
                  })
                }
              >
                {busy ? "Deleting…" : "Delete forever"}
              </button>
            </>
          ) : null}

          {modal === "logout" ? (
            <>
              <p className="pf-helper">You will need to sign in again on this device.</p>
              <button type="button" className="pf-danger" onClick={logout}>
                Log out
              </button>
            </>
          ) : null}

          {modal === "friend" ? (
            <>
              <p className="pf-helper">
                {profile.friendState === "outgoing"
                  ? "Your request has not been accepted yet."
                  : "You can add this player again later."}
              </p>
              <button
                type="button"
                className="pf-danger"
                disabled={busy}
                onClick={() => friendship(profile.friendState === "outgoing" ? "cancel" : "remove")}
              >
                {profile.friendState === "outgoing" ? "Cancel request" : "Remove friend"}
              </button>
            </>
          ) : null}

          {modal === "remove-photo" ? (
            <>
              <p className="pf-helper">Your profile will use your initial instead.</p>
              <button
                type="button"
                className="pf-danger"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    await mutate("/profile/avatar", undefined, "DELETE");
                    setModal(null);
                    setMessage("Photo removed");
                  })
                }
              >
                Remove photo
              </button>
            </>
          ) : null}

          {failure ? (
            <p className="pf-error" role="alert">
              {failure}
            </p>
          ) : null}
        </ProfileModal>
      ) : null}
    </main>
  );
}
