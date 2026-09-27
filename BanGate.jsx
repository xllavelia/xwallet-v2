import React, { useState, useEffect, useRef } from "react";
import { authFetch } from "./apiClient";

function BanGate() {
  var [ban, setBan] = useState(null);
  var timerRef = useRef(null);

  useEffect(function () {
    var alive = true;

    function check() {
      var token = localStorage.getItem("xw_token");
      if (!token) {
        if (alive) setBan(null);
        return;
      }
      authFetch("/auth/status")
        .then(function (data) {
          if (!alive) return;
          if (data.accountBanned || data.deviceBanned) {
            setBan(data);
          } else {
            setBan(null);
          }
        })
        .catch(function () {});
    }

    check();
    timerRef.current = setInterval(check, 30000);

    return function () {
      alive = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!ban) return null;

  function handleLogout() {
    localStorage.removeItem("xw_token");
    localStorage.removeItem("xw_session");
    window.location.reload();
  }

  var reasons = [];
  if (ban.accountBanned) reasons.push("Account");
  if (ban.deviceBanned) reasons.push("Device");

  return (
    <div className="ban-gate">
      <div className="ban-gate-card">
        <div className="ban-gate-icon">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
          </svg>
        </div>
        <h2 className="ban-gate-title">Access Restricted</h2>
        <p className="ban-gate-reason">
          {reasons.join(" & ") + " restricted"}
        </p>
        {ban.banReason && ban.banReason !== "unknown" && (
          <p className="ban-gate-detail">{"Reason: " + ban.banReason}</p>
        )}
        {ban.deviceBanned && (
          <p className="ban-gate-detail">This device has been restricted.</p>
        )}
        <button className="ban-gate-logout" onClick={handleLogout}>Log Out</button>
      </div>
    </div>
  );
}

export default BanGate;