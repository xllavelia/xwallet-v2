import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetAll, useProfile, writeProfile } from './useBalance';

const Setting = () => {
  const navigate = useNavigate();

  function roadHome() { navigate("/"); }

  var profile = useProfile();

  var [editingName, setEditingName]     = useState(false);
  var [nameInput,   setNameInput]       = useState("");
  var [notifications, setNotifications] = useState(true);
  var [copyDone,    setCopyDone]        = useState(false);

  function handleStartEdit() {
    setNameInput(profile.name);
    setEditingName(true);
  }

  function handleSaveName() {
    var trimmed = nameInput.trim();
    if (trimmed.length === 0) { setEditingName(false); return; }
    writeProfile({ id: profile.id, name: trimmed });
    setEditingName(false);
  }

  function handleCopyId() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(profile.id).catch(function () {});
    }
    setCopyDone(true);
    setTimeout(function () { setCopyDone(false); }, 1500);
  }

  function toggleNotifications() { setNotifications(!notifications); }

  var avatarInitial  = profile.name ? profile.name[0].toUpperCase() : "U";
  var copyBtnLabel   = copyDone ? "Copied!" : "Copy";
  var toggleClass    = "custom-toggle " + (notifications ? "toggle-on" : "toggle-off");

  return (
    <div className="SettingContent">
      <div className="Road-Home" onClick={roadHome}></div>

      <div className="settings-layout">

        <header className="settings-header">
          <h1 className="settings-title">Settings</h1>
        </header>

        <section className="profile-section">
          <div className="profile-card-glass">
            <div className="profile-avatar-large">{avatarInitial}</div>
            <div className="profile-info">

              {editingName ? (
                <div className="profile-name-edit">
                  <input
                    className="profile-name-input"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    maxLength={24}
                    autoFocus
                  />
                  <button className="btn-save-name" onClick={handleSaveName}>Save</button>
                </div>
              ) : (
                <h2 className="profile-nickname" onClick={handleStartEdit}>
                  {profile.name}
                </h2>
              )}

              <div className="profile-id-box">
                <span className="id-label">ID:</span>
                <span className="id-value id-mono">{profile.id}</span>
                <button className="btn-copy" onClick={handleCopyId}>{copyBtnLabel}</button>
              </div>


            </div>
          </div>
        </section>

        <section className="settings-menu-block">

          <div className="menu-item-row">
            <div className="menu-item-left">
              <div className="menu-icon-box"></div>
              <span className="menu-text">Account Details</span>
            </div>
            <div className="menu-item-right">›</div>
          </div>

          <div className="menu-item-row">
            <div className="menu-item-left">
              <div className="menu-icon-box"></div>
              <span className="menu-text">Confidentiality</span>
            </div>
            <div className="menu-item-right">›</div>
          </div>

          <div className="menu-item-row">
            <div className="menu-item-left">
              <div className="menu-icon-box"></div>
              <span className="menu-text">Invite Friends</span>
            </div>
            <div className="menu-item-right">
              <span className="menu-badge">bonus</span>
              <span>›</span>
            </div>
          </div>

          <div className="menu-item-row" onClick={toggleNotifications}>
            <div className="menu-item-left">
              <div className="menu-icon-box"></div>
              <span className="menu-text">Push Notifications</span>
            </div>
            <div className="menu-item-right">
              <div className={toggleClass}>
                <div className="toggle-knob"></div>
              </div>
            </div>
          </div>

        </section>

        <footer className="settings-footer">
          <div className="footer-links">
            <div className="footer-link-item">Contact Information</div>
            <div className="footer-link-item" onClick={resetAll}>Privacy Policy</div>
            <div className="footer-link-item">Terms Of Use</div>
          </div>
          <div className="app-version-info">
            <span>xwallet</span>
            <span className="version-number">v.1.0.0</span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default Setting;
