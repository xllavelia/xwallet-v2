var API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
var TOKEN_KEY = "xw_token";

async function authFetch(path, options) {
  var token = localStorage.getItem(TOKEN_KEY);
  var opts = options || {};
  var headers = Object.assign({}, opts.headers, {
    "Authorization": "Bearer " + token
  });

  var res = await fetch(API_BASE + path, Object.assign({}, opts, { headers: headers }));
  var data = await res.json().catch(function () { return null; });

  if (!res.ok) {
    var message = (data && data.error) ? data.error : ("Request failed (" + res.status + ")");
    throw new Error(message);
  }
  return data;
}

// PlayerId из токена нужен только чтобы разделять локальные настройки по аккаунтам.
function currentPlayerId() {
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) return "";
  try {
    var payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload && payload.playerId != null ? String(payload.playerId) : "";
  } catch (err) {
    return "";
  }
}

export { authFetch, API_BASE, currentPlayerId };