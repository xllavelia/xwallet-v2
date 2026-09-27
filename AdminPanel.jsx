import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "./apiClient";


var STATUS_OPTIONS = ["lucky", "young", "saint", "legendary", "legacy", "rivender", "royal"];

function AdminPanel() {
  const navigate = useNavigate();
  function roadHome() { navigate(-1); }

  var [stats, setStats] = useState(null);
  var [users, setUsers] = useState([]);
  var [search, setSearch] = useState("");
  var [offset, setOffset] = useState(0);
  var [selectedPlayerId, setSelectedPlayerId] = useState(null);
  var [detail, setDetail] = useState(null);
  var [balanceInput, setBalanceInput] = useState("");
  var [lavxInput, setLavxInput] = useState("");
  var [statusToGrant, setStatusToGrant] = useState(STATUS_OPTIONS[0]);
  var [toast, setToast] = useState(null);
  var [isBusy, setIsBusy] = useState(false);

  
  var [banPlayerId, setBanPlayerId] = useState("");
  var [banReason, setBanReason] = useState("");
  var [banMsg, setBanMsg] = useState(null);
  var [maintActive, setMaintActive] = useState(false);
  var [maintUntil, setMaintUntil] = useState("");
  var [maintMinutes, setMaintMinutes] = useState(30);
  var [maintMsg, setMaintMsg] = useState(null);

  function fetchMaintenance() {
    authFetch("/admin/maintenance")
      .then(function (data) {
        setMaintActive(!!data.maintenance);
        setMaintUntil(data.until || "");
      })
      .catch(function () {});
  }

  useEffect(function () {
    fetchMaintenance();
    var iv = setInterval(fetchMaintenance, 15000);
    return function () { clearInterval(iv); };
  }, []);

  function doBan(device) {
    if (!banPlayerId.trim()) return;
    setBanMsg(null);
    authFetch("/admin/users/ban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId: banPlayerId.trim(), device: device, reason: banReason.trim() })
    })
      .then(function () {
        setBanMsg({ ok: true, text: device ? "Device banned" : "Account banned" });
        setBanPlayerId("");
        setBanReason("");
      })
      .catch(function (err) {
        setBanMsg({ ok: false, text: err.message || "Error" });
      });
  }

  function doUnban() {
    if (!banPlayerId.trim()) return;
    setBanMsg(null);
    authFetch("/admin/users/unban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ playerId: banPlayerId.trim() })
    })
      .then(function () {
        setBanMsg({ ok: true, text: "Unbanned" });
        setBanPlayerId("");
        setBanReason("");
      })
      .catch(function (err) {
        setBanMsg({ ok: false, text: err.message || "Error" });
      });
  }

  function doSetMaintenance() {
    setMaintMsg(null);
    authFetch("/admin/maintenance/set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minutes: maintMinutes })
    })
      .then(function () {
        setMaintMsg({ ok: true, text: "Maintenance set for " + maintMinutes + " min" });
        fetchMaintenance();
      })
      .catch(function (err) {
        setMaintMsg({ ok: false, text: err.message || "Error" });
      });
  }

  function doSetMaintenanceIndefinite() {
    setMaintMsg(null);
    authFetch("/admin/maintenance/set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    })
      .then(function () {
        setMaintMsg({ ok: true, text: "Maintenance set indefinitely" });
        fetchMaintenance();
      })
      .catch(function (err) {
        setMaintMsg({ ok: false, text: err.message || "Error" });
      });
  }

  function doClearMaintenance() {
    setMaintMsg(null);
    authFetch("/admin/maintenance/clear", { method: "POST" })
      .then(function () {
        setMaintMsg({ ok: true, text: "Maintenance cleared" });
        fetchMaintenance();
      })
      .catch(function (err) {
        setMaintMsg({ ok: false, text: err.message || "Error" });
      });
  }

  var loadStats = useCallback(function () {
    authFetch("/admin/stats").then(setStats).catch(function () {});
  }, []);

  var loadUsers = useCallback(function (q, off) {
    authFetch("/admin/users?q=" + encodeURIComponent(q || "") + "&limit=50&offset=" + (off || 0))
      .then(function (res) {
        if ((off || 0) === 0) { setUsers(res || []); }
        else { setUsers(function (prev) { return prev.concat(res || []); }); }
      })
      .catch(function () {});
  }, []);

  useEffect(function () { loadStats(); }, [loadStats]);
  useEffect(function () {
    var handle = setTimeout(function () { setOffset(0); loadUsers(search, 0); }, 250);
    return function () { clearTimeout(handle); };
  }, [search, loadUsers]);

  function pushToast(text) {
    setToast(text);
    setTimeout(function () { setToast(null); }, 2200);
  }

  function openUser(playerId) {
    setSelectedPlayerId(playerId);
    authFetch("/admin/users/detail?playerId=" + playerId).then(function (res) {
      setDetail(res);
      setBalanceInput(res.balance.toFixed(2));
      setLavxInput(res.lavxBalance.toFixed(2));
    }).catch(function () {});
  }
  function closeDetail() { setSelectedPlayerId(null); setDetail(null); }

  function refreshAll() {
    loadStats();
    loadUsers(search, 0);
    setOffset(0);
    if (selectedPlayerId) openUser(selectedPlayerId);
  }

  async function handleSetBalance() {
    setIsBusy(true);
    try {
      await authFetch("/admin/users/set-balance", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: selectedPlayerId, balance: parseFloat(balanceInput) || 0 })
      });
      pushToast("Balance updated");
      refreshAll();
    } catch (err) { pushToast(err.message); } finally { setIsBusy(false); }
  }

  async function handleSetLavx() {
    setIsBusy(true);
    try {
      await authFetch("/admin/users/set-lavx", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: selectedPlayerId, lavx: parseFloat(lavxInput) || 0 })
      });
      pushToast("LAVX updated");
      refreshAll();
    } catch (err) { pushToast(err.message); } finally { setIsBusy(false); }
  }

  async function handleGrantStatus() {
    setIsBusy(true);
    try {
      await authFetch("/admin/users/grant-status", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: selectedPlayerId, status: statusToGrant })
      });
      pushToast("Status granted");
      refreshAll();
    } catch (err) { pushToast(err.message); } finally { setIsBusy(false); }
  }

  async function handleRevokeStatus(status) {
    setIsBusy(true);
    try {
      await authFetch("/admin/users/revoke-status", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: selectedPlayerId, status: status })
      });
      pushToast("Status revoked");
      refreshAll();
    } catch (err) { pushToast(err.message); } finally { setIsBusy(false); }
  }

  async function handleToggleAdmin() {
    setIsBusy(true);
    try {
      await authFetch("/admin/users/set-admin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId: selectedPlayerId, isAdmin: !detail.isAdmin })
      });
      pushToast(detail.isAdmin ? "Admin revoked" : "Admin granted");
      refreshAll();
    } catch (err) { pushToast(err.message); } finally { setIsBusy(false); }
  }

  async function handleDeleteUser() {
    var confirmed = window.confirm("Permanently delete " + selectedPlayerId + "? This cannot be undone.");
    if (!confirmed) return;
    setIsBusy(true);
    try {
      await authFetch("/admin/users/delete?playerId=" + selectedPlayerId, { method: "DELETE" });
      pushToast("User deleted");
      closeDetail();
      refreshAll();
    } catch (err) { pushToast(err.message); } finally { setIsBusy(false); }
  }

  function handleLoadMore() {
    var nextOffset = offset + 50;
    setOffset(nextOffset);
    loadUsers(search, nextOffset);
  }

  return (
    <div className="AdminPanelContent">
      <div className="Road-Home" onClick={roadHome}></div>

      {toast && <div className="adm-toast">{toast}</div>}

      <div className="adm-page">
        <div className="adm-header" onClick={roadHome}>
          <span className="adm-eyebrow">Owner Access</span>
          <h1 className="adm-title">Admin Panel</h1>
        </div>

        {stats && (
          <div className="adm-stats-grid">
            <div className="adm-stat-card"><span>USERS</span><strong>{stats.totalUsers}</strong></div>
            <div className="adm-stat-card"><span>TOTAL USDT</span><strong>{"$" + stats.totalBalance.toFixed(2)}</strong></div>
            <div className="adm-stat-card"><span>TOTAL LAVX</span><strong>{stats.totalLavx.toFixed(0)}</strong></div>
            <div className="adm-stat-card"><span>OPEN TRADES</span><strong>{stats.openPositions}</strong></div>
            <div className="adm-stat-card"><span>CLOSED TRADES</span><strong>{stats.closedPositions}</strong></div>
            <div className="adm-stat-card"><span>VOLUME</span><strong>{"$" + stats.totalVolume.toFixed(0)}</strong></div>
            <div className="adm-stat-card"><span>TRANSFERS</span><strong>{stats.totalTransfers}</strong></div>
            <div className="adm-stat-card"><span>TRANSFER VOL</span><strong>{"$" + stats.transferVolume.toFixed(0)}</strong></div>
            <div className="adm-stat-card"><span>ACTIVE VOUCHERS</span><strong>{stats.totalVouchers}</strong></div>
            <div className="adm-stat-card"><span>ACTIVE SUBS</span><strong>{stats.activeSubs}</strong></div>
          </div>
        )}

      {/* ── Bans ──────────────────────────────────── */}
      <div className="adm-section">
        <div className="adm-ban-block">
          <input
            className="adm-input"
            placeholder="Player ID"
            value={banPlayerId}
            onChange={function (e) { setBanPlayerId(e.target.value); }}
          />
          <input
            className="adm-input"
            placeholder="Reason (optional)"
            value={banReason}
            onChange={function (e) { setBanReason(e.target.value); }}
          />
          <div className="adm-ban-btns">
            <button className="adm-ban-btn" onClick={function () { doBan(false); }}>Ban Account</button>
            <button className="adm-ban-btn adm-ban-device" onClick={function () { doBan(true); }}>Ban Device</button>
            <button className="adm-unban-btn" onClick={doUnban}>Unban</button>
          </div>
          {banMsg && (
            <div className={"adm-msg " + (banMsg.ok ? "ok" : "err")}>{banMsg.text}</div>
          )}
        </div>
      </div>

      {/* ── Maintenance ──────────────────────────── */}
      <div className="adm-section">
        <div className="adm-maint-block">
          <div className="adm-maint-status">
            <span className={"adm-maint-dot " + (maintActive ? "on" : "off")}></span>
            <span>{maintActive ? "Active" : "Inactive"}</span>
            {maintActive && maintUntil && (
              <span className="adm-maint-until">{"until " + new Date(maintUntil).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
            )}
          </div>
          <div className="adm-maint-controls">
            <div className="adm-maint-durations">
              {[15, 30, 60, 120].map(function (m) {
                return (
                  <button
                    key={m}
                    className={"adm-maint-dur" + (maintMinutes === m ? " active" : "")}
                    onClick={function () { setMaintMinutes(m); }}
                  >
                    {m < 60 ? m + "m" : (m / 60) + "h"}
                  </button>
                );
              })}
            </div>
            <div className="adm-maint-actions">
              <button className="adm-maint-set-btn" onClick={doSetMaintenance}>Set Timer</button>
              <button className="adm-maint-set-btn adm-maint-indef" onClick={doSetMaintenanceIndefinite}>Indefinite</button>
              <button className="adm-maint-clear-btn" onClick={doClearMaintenance} disabled={!maintActive}>Clear</button>
            </div>
          </div>
          {maintMsg && (
            <div className={"adm-msg " + (maintMsg.ok ? "ok" : "err")}>{maintMsg.text}</div>
          )}
        </div>
      </div>

        <div className="adm-search-bar">
          <input
            className="adm-search-input"
            placeholder="Search by username or player ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="adm-user-list">
          {users.map(function (u) {
            return (
              <div className="adm-user-row" key={u.playerId} onClick={() => openUser(u.playerId)}>
                <div className="adm-user-left">
                  <span className="adm-user-name">
                    {u.username}
                    {u.isAdmin && <span className="adm-admin-tag">ADMIN</span>}
                  </span>
                  <span className="adm-user-id">{u.playerId}</span>
                </div>
                <div className="adm-user-right">
                  <span className="adm-user-balance">{"$" + u.balance.toFixed(2)}</span>
                  {u.primeTier && <span className="adm-user-tier">{u.primeTier.toUpperCase()}</span>}
                </div>
                <div className="adm-user-chevron">›</div>
              </div>
            );
          })}
        </div>

        {users.length >= 50 && (
          <button className="adm-load-more" onClick={handleLoadMore}>Load More</button>
        )}
      </div>

      {detail && (
        <div className="adm-detail-overlay" onClick={closeDetail}>
          <div className="adm-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="adm-detail-handle"></div>

            <div className="adm-detail-top">
              <div>
                <span className="adm-detail-name">{detail.username}</span>
                <span className="adm-detail-id">{detail.playerId}</span>
              </div>
              <button className="adm-detail-close" onClick={closeDetail}>✕</button>
            </div>

            <div className="adm-detail-grid">
              <div className="adm-detail-row"><span>Member since</span><span>{new Date(detail.createdAt).toLocaleDateString("en-US")}</span></div>
              <div className="adm-detail-row"><span>Prime Tier</span><span>{detail.primeTier || "None"}</span></div>
              <div className="adm-detail-row"><span>Referral Code</span><span>{detail.referralCode || "—"}</span></div>
              <div className="adm-detail-row"><span>Referral XP</span><span>{detail.refXp}</span></div>
              <div className="adm-detail-row"><span>Battle Pass</span><span>{detail.battlepassTrack ? (detail.battlepassTrack + " · " + detail.battlepassXp + " XP") : "None"}</span></div>
              <div className="adm-detail-row"><span>Open / Closed Trades</span><span>{detail.openPositions + " / " + detail.closedPositions}</span></div>
              <div className="adm-detail-row"><span>Vouchers</span><span>{detail.voucherCount}</span></div>
            </div>

            {detail.statuses.length > 0 && (
              <div className="adm-status-list">
                {detail.statuses.map(function (s) {
                  return (
                    <span key={s} className="adm-status-chip" onClick={() => handleRevokeStatus(s)}>
                      {s.toUpperCase()} ✕
                    </span>
                  );
                })}
              </div>
            )}

            <div className="adm-detail-divider"></div>

            <div className="adm-control-group">
              <span className="adm-control-label">USDT Balance</span>
              <div className="adm-control-row">
                <input className="adm-control-input" value={balanceInput} onChange={(e) => setBalanceInput(e.target.value)} />
                <button className="adm-control-btn" disabled={isBusy} onClick={handleSetBalance}>Set</button>
              </div>
            </div>

            <div className="adm-control-group">
              <span className="adm-control-label">LAVX Balance</span>
              <div className="adm-control-row">
                <input className="adm-control-input" value={lavxInput} onChange={(e) => setLavxInput(e.target.value)} />
                <button className="adm-control-btn" disabled={isBusy} onClick={handleSetLavx}>Set</button>
              </div>
            </div>

            <div className="adm-control-group">
              <span className="adm-control-label">Grant Status</span>
              <div className="adm-control-row">
                <select className="adm-control-select" value={statusToGrant} onChange={(e) => setStatusToGrant(e.target.value)}>
                  {STATUS_OPTIONS.map(function (s) { return <option key={s} value={s}>{s}</option>; })}
                </select>
                <button className="adm-control-btn" disabled={isBusy} onClick={handleGrantStatus}>Grant</button>
              </div>
            </div>

            <div className="adm-detail-divider"></div>

            <div className="adm-danger-actions">
              <button className="adm-toggle-admin-btn" disabled={isBusy} onClick={handleToggleAdmin}>
                {detail.isAdmin ? "Revoke Admin" : "Grant Admin"}
              </button>
              <button className="adm-delete-btn" disabled={isBusy} onClick={handleDeleteUser}>Delete User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;