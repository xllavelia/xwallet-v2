import { authFetch, API_BASE } from "./apiClient";

var AVATAR_PALETTE = ["#5B8C7B", "#C97B63", "#6E7FD1", "#B98B4E",
"#8B6FA8", "#4F8FA3"];
var TOKEN_KEY = "xw_token";

function getInitials(name) {
  if (!name) return "?";
  var parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function colorForId(id) {
  var s = (id === undefined || id === null) ? "" : String(id);
  if (s.length === 0) return AVATAR_PALETTE[0];
  var sum = 0;
  for (var i = 0; i < s.length; i++) sum += s.charCodeAt(i);
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
}

// Бэкенд в разные эпохи отдавал и плоский массив, и обёртку {results: [...]}.
// Разворачиваем оба формата, чтобы фронт не зависел от версии хендлера.
function extractList(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.results)) {
    console.warn("[contacts] сервер вернул обёрнутый формат {results: [...]} — на бэкенке всё ещё debug-версия хендлера поиска");
    return res.results;
  }
  if (res && Array.isArray(res.contacts)) return res.contacts;
  return [];
}

function decorate(item) {
  var playerId = item.playerId !== undefined ? item.playerId : item.PlayerID;
  var username = item.username !== undefined ? item.username : item.Username;
  var isContact = item.isContact !== undefined ? item.isContact : item.IsContact;
  return {
    id: playerId,
    name: username,
    isContact: !!isContact,
    color: colorForId(playerId),
    cardNumber: null
  };
}

async function searchUsers(query) {
  if (!query || query.length === 0) return [];
  var res = await authFetch("/users/search?q=" + encodeURIComponent(query));
  return extractList(res).map(decorate);
}

async function searchCards(prefix) {
  if (!prefix || prefix.length === 0) return [];
  var res = await authFetch("/bankcards/search?q=" + encodeURIComponent(prefix));
  return extractList(res).map(function (item) {
    var playerId = item.playerId !== undefined ? item.playerId : item.PlayerID;
    var username = item.username !== undefined ? item.username : item.Username;
    return {
      id: playerId,
      name: username,
      isContact: false,
      color: colorForId(playerId),
      cardNumber: item.cardNumber !== undefined ? item.cardNumber : item.CardNumber,
      tier: item.tier !== undefined ? item.tier : item.Tier
    };
  });
}

async function listContacts() {
  var res = await authFetch("/contacts/list");
  return extractList(res).map(function (c) {
    var item = decorate(c);
    item.isContact = true;
    return item;
  });
}

async function addContact(playerId) {
  return authFetch("/contacts/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contactPlayerId: playerId })
  });
}

async function removeContact(playerId) {
  return authFetch("/contacts/remove", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contactPlayerId: playerId })
  });
}

export { searchUsers, searchCards, listContacts, addContact, removeContact,
getInitials };