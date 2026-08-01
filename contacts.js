import { API_BASE } from "./apiClient";

var AVATAR_PALETTE = ["#5B8C7B", "#C97B63", "#6E7FD1", "#B98B4E", "#8B6FA8", "#4F8FA3"];
var TOKEN_KEY = "xw_token";

function getInitials(name) {
  if (!name) return "?";
  var parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function colorForId(id) {
  var sum = 0;
  for (var i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
}

function decorate(item) {
  return {
    id: item.playerId,
    name: item.username,
    isContact: !!item.isContact,
    color: colorForId(item.playerId)
  };
}

// Возвращает { results, debug } — debug всегда заполнен, независимо от исхода.
async function searchUsers(query) {
  var debug = { url: null, status: null, rawText: null, error: null };

  if (!query || query.length === 0) {
    return { results: [], debug: debug };
  }

  var token = localStorage.getItem(TOKEN_KEY);
  var url = API_BASE + "/users/search?q=" + encodeURIComponent(query);
  debug.url = url;

  try {
    var res = await fetch(url, { headers: { "Authorization": "Bearer " + token } });
    debug.status = res.status;

    var text = await res.text();
    debug.rawText = text;

    var data = null;
    try { data = JSON.parse(text); } catch (parseErr) {
      debug.error = "Response is not valid JSON";
      return { results: [], debug: debug };
    }

    if (!res.ok) {
      debug.error = (data && data.error) ? data.error : ("HTTP " + res.status);
      return { results: [], debug: debug };
    }

    if (!data || !Array.isArray(data.results)) {
      debug.error = "Response missing 'results' array";
      return { results: [], debug: debug };
    }

    debug.error = null;
    return { results: data.results.map(decorate), debug: debug };

  } catch (err) {
    debug.error = "Network error: " + err.message;
    return { results: [], debug: debug };
  }
}

async function listContacts() {
  var token = localStorage.getItem(TOKEN_KEY);
  try {
    var res = await fetch(API_BASE + "/contacts/list", { headers: { "Authorization": "Bearer " + token } });
    var data = await res.json();
    if (!Array.isArray(data)) return [];
    return data.map(function (c) {
      return decorate({ playerId: c.playerId, username: c.username, isContact: true });
    });
  } catch (err) {
    return [];
  }
}

async function addContact(playerId) {
  var token = localStorage.getItem(TOKEN_KEY);
  return fetch(API_BASE + "/contacts/add", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
    body: JSON.stringify({ contactPlayerId: playerId })
  });
}

export { searchUsers, listContacts, addContact, getInitials };