import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccount, updateUsername, changePassword, deleteAccount } from "./useAccount";
import { useBattlePass } from "./useBattlePass";


const Setting = () => {
  const navigate = useNavigate();

  var { account, refresh } = useAccount();
  var { data: bpData } = useBattlePass();

  function handleLogout() {
    localStorage.removeItem("xw_session");
    localStorage.removeItem("xw_token");
    navigate("/");
    window.location.reload();
  }

function goTo(path) {
  navigate(path);
}
  var [editingName, setEditingName] = useState(false);
  var [nameInput, setNameInput] = useState("");
  var [nameError, setNameError] = useState(null);
  var [copyDone, setCopyDone] = useState(false);

  var [showPasswordForm, setShowPasswordForm] = useState(false);
  var [currentPw, setCurrentPw] = useState("");
  var [newPw, setNewPw] = useState("");
  var [confirmPw, setConfirmPw] = useState("");
  var [pwError, setPwError] = useState(null);
  var [pwSuccess, setPwSuccess] = useState(null);
  var [pwBusy, setPwBusy] = useState(false);

  var [showDeleteModal, setShowDeleteModal] = useState(false);
  var [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  var [deleteBusy, setDeleteBusy] = useState(false);

  if (!account) {
    return <div className="SettingContent"></div>;
  }

  function handleStartEdit() {
    setNameInput(account.username);
    setNameError(null);
    setEditingName(true);
  }

  async function handleSaveName() {
    var trimmed = nameInput.trim();
    if (trimmed.length < 3) {
      setNameError("Username must be at least 3 characters");
      return;
    }
    try {
      await updateUsername(trimmed);
      setEditingName(false);
      refresh();
    } catch (err) {
      setNameError(err.message);
    }
  }

  function handleCopyId() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(account.playerId).catch(function () {});
    }
    setCopyDone(true);
    setTimeout(function () { setCopyDone(false); }, 1500);
  }

  async function handleSubmitPassword() {
    setPwError(null);
    setPwSuccess(null);
    if (newPw.length < 6) { setPwError("New password must be at least 6 characters"); return; }
    if (newPw !== confirmPw) { setPwError("Passwords do not match"); return; }
    setPwBusy(true);
    try {
      await changePassword(currentPw, newPw);
      setPwSuccess("Password updated");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(function () { setShowPasswordForm(false); setPwSuccess(null); }, 1600);
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwBusy(false);
    }
  }

  async function handleConfirmDelete() {
    if (deleteConfirmInput.trim().toLowerCase() !== account.username.toLowerCase()) return;
    setDeleteBusy(true);
    try {
      await deleteAccount();
      localStorage.clear();
      navigate("/");
      window.location.reload();
    } catch (err) {
      setDeleteBusy(false);
    }
  }

  var avatarInitial = account.username ? account.username[0].toUpperCase() : "U";
  var copyBtnLabel = copyDone ? "Copied!" : "Copy";
  var memberSince = new Date(account.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  var statuses = (bpData && bpData.statuses) || [];
  var deleteMatches = deleteConfirmInput.trim().toLowerCase() === account.username.toLowerCase();

return (
  <div className="SettingContent">
    <div className="settings-layout">

      {/* PROFILE HERO */}
      <section className="stx-profile-hero">

        <div className="stx-profile-glow"></div>

        <div className="stx-profile-top">
          <div className="stx-avatar">
            {avatarInitial}
          </div>

          <div className="stx-profile-main">
            {editingName ? (
              <div className="profile-name-edit">
                <input
                  className="profile-name-input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  maxLength={24}
                  autoFocus
                />

                <button
                  className="btn-save-name"
                  onClick={handleSaveName}
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                className="stx-name-button"
                onClick={handleStartEdit}
              >
                <span>{account.username}</span>
                <span className="stx-edit-icon">✎</span>
              </button>
            )}

            {nameError && (
              <span className="stx-error-text">{nameError}</span>
            )}

            <div className="stx-member-since">
              Member since {memberSince}
            </div>
          </div>

          <div className="stx-profile-status">
            <span className="stx-online-dot"></span>
            Active
          </div>
        </div>

        {/* PLAYER ID */}
        <button
          className="stx-player-id"
          onClick={handleCopyId}
        >
          <div>
            <span className="stx-id-caption">PLAYER ID</span>
            <span className="id-mono">{account.playerId}</span>
          </div>

          <span className={"stx-copy-action " + (copyDone ? "copied" : "")}>
            {copyDone ? "✓ Copied" : "Copy"}
          </span>
        </button>

        {/* STATUS */}
        {statuses.length > 0 && (
          <div className="stx-status-row">
            {statuses.map(function (s) {
              return (
                <span
                  key={s}
                  className={"bp-status-badge bp-status-" + s}
                >
                  {s.toUpperCase()}
                </span>
              );
            })}
          </div>
        )}

      </section>


      {/* ACCOUNT */}
      <section className="stx-section">
        <div className="stx-section-header">
          <span>ACCOUNT</span>
        </div>

        <div className="settings-menu-block">

          <div
            className="menu-item-row"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            <div className="menu-item-left">

              <div className="stx-menu-copy">
                <span className="menu-text">Password & Security</span>
                <small>Keep your account protected</small>
              </div>
            </div>

            <div className="menu-item-right">
              <span className="stx-arrow">
                {showPasswordForm ? "⌃" : "›"}
              </span>
            </div>
          </div>

          {showPasswordForm && (
            <div className="stx-password-form">

              <input
                type="password"
                placeholder="Current password"
                className="stx-input"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
              />

              <input
                type="password"
                placeholder="New password"
                className="stx-input"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />

              <input
                type="password"
                placeholder="Confirm new password"
                className="stx-input"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
              />

              {pwError && (
                <span className="stx-error-text">{pwError}</span>
              )}

              {pwSuccess && (
                <span className="stx-success-text">{pwSuccess}</span>
              )}

              <button
                className="btn-save-name stx-full-width"
                disabled={pwBusy}
                onClick={handleSubmitPassword}
              >
                {pwBusy ? "Updating..." : "Update Password"}
              </button>
            </div>
          )}

          <div
            className="menu-item-row stx-logout-row"
            onClick={handleLogout}
          >
            <div className="menu-item-left">

              <div className="stx-menu-copy">
                <span className="menu-text">Log Out</span>
                <small>Sign out of this device</small>
              </div>
            </div>

            <div className="menu-item-right">
              <span className="stx-arrow">›</span>
            </div>
          </div>

        </div>
      </section>


      {/* REWARDS & BENEFITS */}
      <section className="stx-section">
        <div className="stx-section-header">
          <span>REWARDS & BENEFITS</span>
        </div>

        <div className="settings-menu-block">

          <div
            className="menu-item-row stx-feature-row"
            onClick={() => goTo("/promocode")}
          >
            <div className="menu-item-left">

              <div className="stx-menu-copy">
                <span className="menu-text">Promocodes</span>
                <small>Redeem special offers</small>
              </div>
            </div>

            <div className="menu-item-right">
              <span className="stx-arrow">›</span>
            </div>
          </div>


          <div
            className="menu-item-row stx-feature-row"
            onClick={() => goTo("/referral")}
          >
            <div className="menu-item-left">

              <div className="stx-menu-copy">
                <span className="menu-text">Invite Friends</span>
                <small>Earn rewards together</small>
              </div>
            </div>

            <div className="menu-item-right">
              {/* <span className="menu-badge">BONUS</span> */}
              <span className="stx-arrow">›</span>
            </div>
          </div>


          <div
            className="menu-item-row stx-feature-row"
            onClick={() => goTo("/bonus")}
          >
            <div className="menu-item-left">

              <div className="stx-menu-copy">
                <span className="menu-text">My Vouchers</span>
                <small>Your available rewards</small>
              </div>
            </div>

            <div className="menu-item-right">
              <span className="stx-arrow">›</span>
            </div>
          </div>


          <div
            className="menu-item-row stx-feature-row"
            onClick={() => goTo("/prime")}
          >
            <div className="menu-item-left">

              <div className="stx-menu-copy">
                <span className="menu-text">Prime Membership</span>
                <small>Unlock premium benefits</small>
              </div>
            </div>

            <div className="menu-item-right">
              <span className="stx-arrow">›</span>
            </div>
          </div>


          <div
            className="menu-item-row stx-feature-row"
            onClick={() => goTo("/battlepass")}
          >
            <div className="menu-item-left">

              <div className="stx-menu-copy">
                <span className="menu-text">Battle Pass</span>
                <small>Complete missions & earn XP</small>
              </div>
            </div>

            <div className="menu-item-right">
              <span className="stx-arrow">›</span>
            </div>
          </div>


          <div
            className="menu-item-row stx-feature-row"
            onClick={() => goTo("/card")}
          >
            <div className="menu-item-left">

              <div className="stx-menu-copy">
                <span className="menu-text">Crypto Card</span>
                <small>Manage your virtual card</small>
              </div>
            </div>

            <div className="menu-item-right">
              <span className="stx-arrow">›</span>
            </div>
          </div>

        </div>
      </section>


      {/* DANGER */}
      <section className="stx-section">
        <div className="stx-section-header danger-header">
          <span>DANGER ZONE</span>
        </div>

        <div className="settings-menu-block">

          <div
            className="menu-item-row stx-danger-row"
            onClick={() => setShowDeleteModal(true)}
          >
            <div className="menu-item-left">

              <div className="stx-menu-copy">
                <span className="menu-text">Delete Account</span>
                <small>This action cannot be undone</small>
              </div>
            </div>

            <div className="menu-item-right">
              <span className="stx-arrow">›</span>
            </div>
          </div>

        </div>
      </section>


      {/* ADMIN */}
      {account.isAdmin && (
        <section className="stx-section">
          <div className="settings-menu-block">

            <div
              className="menu-item-row stx-admin-row"
              onClick={() => goTo("/admin")}
            >
              <div className="menu-item-left">

                <div className="stx-menu-copy">
                  <span className="menu-text">Admin Panel</span>
                  <small>System administration</small>
                </div>
              </div>

              <div className="menu-item-right">
                <span className="stx-arrow">›</span>
              </div>
            </div>

          </div>
        </section>
      )}


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

            <button className="signatureButton" onClick={() => navigate("/emblem")}>
              <span>View the emblem</span>
              <b></b>
            </button>
          </div>

          <div className="signatureOrbital orbitalOne"></div>
          <div className="signatureOrbital orbitalTwo"></div>
        </section>

      {/* FOOTER */}
      <footer className="settings-footer">

        <div className="footer-links">
          <div className="footer-link-item">Contact Information</div>
          <div className="footer-link-item">Privacy Policy</div>
          <div className="footer-link-item">Terms Of Use</div>
        </div>

        <div className="app-version-info">
          <span className="stx-brand">xwallet</span>
          <span className="stx-brand">lavx dev</span>

          <span className="version-number">v.1.0.0</span>
        </div>

      </footer>

    </div>


    {/* DELETE MODAL */}
    {showDeleteModal && (
      <div
        className="stx-modal-overlay"
        onClick={() => setShowDeleteModal(false)}
      >
        <div
          className="stx-modal"
          onClick={(e) => e.stopPropagation()}
        >

          <div className="stx-delete-symbol">!</div>

          <h3 className="stx-modal-title">
            Delete Account
          </h3>

          <p className="stx-modal-text">
            This permanently deletes your account, balance,
            positions, and history. This cannot be undone.
          </p>

          <p className="stx-modal-confirm-label">
            Type <strong>{account.username}</strong> to confirm.
          </p>

          <input
            className="stx-input"
            value={deleteConfirmInput}
            onChange={(e) => setDeleteConfirmInput(e.target.value)}
            placeholder="Type your username"
          />

          <div className="stx-modal-actions">

            <button
              className="stx-modal-cancel"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>

            <button
              className="stx-modal-confirm"
              disabled={!deleteMatches || deleteBusy}
              onClick={handleConfirmDelete}
            >
              {deleteBusy ? "Deleting..." : "Delete Forever"}
            </button>

          </div>
        </div>
      </div>
    )}

  </div>
);

};

export default Setting;