import React, { lazy, Suspense, useEffect, useState } from "react";
import Home from "./Home";

var SESSION_KEY = "xw_session";
var TOKEN_KEY = "xw_token";
var API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const Welcome = lazy(() => import("./Welcome"));

function fetchWithTimeout(url, options, timeoutMs) {
  var controller = new AbortController();
  var timer = setTimeout(function () { controller.abort(); }, timeoutMs);

  return fetch(url, Object.assign({}, options, { signal: controller.signal }))
    .finally(function () { clearTimeout(timer); });
}

function RootGate() {
  var [status, setStatus] = useState("checking");
  var [retryTick, setRetryTick] = useState(0);

  useEffect(function () {
    var token = localStorage.getItem(TOKEN_KEY);
    var hasFlag = localStorage.getItem(SESSION_KEY) === "1";

    if (!token || !hasFlag) {
      setStatus("guest");
      return;
    }

    var cancelled = false;

    fetchWithTimeout(API_BASE + "/auth/me", {
      headers: { "Authorization": "Bearer " + token }
    }, 60000)
      .then(function (res) {
        if (cancelled) return;

        if (res.status === 401 || res.status === 403) {
          // Сервер явно и уверенно отверг токен — сессия правда невалидна.
          localStorage.removeItem(SESSION_KEY);
          localStorage.removeItem(TOKEN_KEY);
          setStatus("guest");
          return;
        }

        if (!res.ok) {
          // Сервер ответил, но не подтвердил и не отверг явно (5xx, просыпается и т.п.) — пробуем ещё раз, не трогая токен.
          throw new Error("server not ready");
        }

        setStatus("authed");
      })
      .catch(function () {
        if (cancelled) return;
        // Сеть/таймаут/сервер спит — токен НЕ трогаем, просто ждём и пробуем снова.
        setTimeout(function () {
          if (!cancelled) setRetryTick(function (t) { return t + 1; });
        }, 3000);
      });

    return function () { cancelled = true; };
  }, [retryTick]);

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