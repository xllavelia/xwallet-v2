import React, { useState, useEffect, useRef } from "react";
import { API_BASE } from "./apiClient";

function formatUntil(iso) {
  if (!iso) return "";
  var d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function MaintenanceOverlay() {
  var [active, setActive] = useState(false);
  var [until, setUntil] = useState("");
  var timerRef = useRef(null);

  useEffect(function () {
    var alive = true;

       function check() {
      var token = localStorage.getItem("xw_token");
      var headers = {};
      if (token) headers["Authorization"] = "Bearer " + token;
      fetch(API_BASE + "/app/status", { headers: headers })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (!alive) return;
          if (data.isAdmin) {
            setActive(false);
            return;
          }
          setActive(!!data.maintenance);
          setUntil(formatUntil(data.until));
        })
        .catch(function () {});
    }
    
    check();
    timerRef.current = setInterval(check, 20000);

    return function () {
      alive = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!active) return null;

  return (
    <div className="maint-overlay">
      <div className="maint-card">
        <div className="maint-icon">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        </div>
        <h2 className="maint-title">Under Maintenance</h2>
        <p className="maint-sub">We're making things better. Check back soon.</p>
        {until && <span className="maint-until">{"Expected back: " + until}</span>}
      </div>
    </div>
  );
}

export default MaintenanceOverlay;