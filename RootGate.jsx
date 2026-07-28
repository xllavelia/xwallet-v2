import React, { lazy, Suspense, useEffect, useState } from "react";
import Home from "./Home";

var SESSION_KEY = "xw_session";
var TOKEN_KEY = "xw_token";
var API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const Welcome = lazy(() => import("./Welcome"));

function RootGate() {
  var [status, setStatus] = useState("checking"); // "checking" | "authed" | "guest"

  useEffect(function () {
    var token = localStorage.getItem(TOKEN_KEY);
    var hasFlag = localStorage.getItem(SESSION_KEY) === "1";

    if (!token || !hasFlag) {
      setStatus("guest");
      return;
    }

    fetch(API_BASE + "/auth/me", {
      headers: { "Authorization": "Bearer " + token }
    })
      .then(function (res) {
        if (!res.ok) throw new Error("invalid session");
        setStatus("authed");
      })
      .catch(function () {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(TOKEN_KEY);
        setStatus("guest");
      });
  }, []);

  if (status === "checking") {
    return <div style={{ background: "#121212", minHeight: "100vh" }}></div>;
  }

  if (status === "authed") {
    return <Home />;
  }

  return (
    <Suspense fallback={<div style={{ background: "#121212", minHeight: "100vh" }}></div>}>
      <Welcome />
    </Suspense>
  );
}

export default RootGate;