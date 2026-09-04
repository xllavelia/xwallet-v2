import { authFetch, API_BASE } from "./apiClient";

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
    color: colorForId(item.playerId || "?"),
    cardNumber: null
  };
}

async function searchUsers(query) {
  if (!query || query.length === 0) return [];
  var res = await authFetch("/users/search?q=" + encodeURIComponent(query));
  if (!Array.isArray(res)) return [];
  return res.map(decorate);
}

async function searchCards(prefix) {
  if (!prefix || prefix.length === 0) return [];
  var res = await authFetch("/bankcards/search?q=" + encodeURIComponent(prefix));
  if (!Array.isArray(res)) return [];
  return res.map(function (item) {
    return {
      id: item.playerId,
      name: item.username,
      isContact: false,
      color: colorForId(item.playerId || "?"),
      cardNumber: item.cardNumber,
      tier: item.tier
    };
  });
}

async function listContacts() {
  var res = await authFetch("/contacts/list");
  if (!Array.isArray(res)) return [];
  return res.map(function (c) {
    return decorate({ playerId: c.playerId, username: c.username, isContact: true });
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

export { searchUsers, searchCards, listContacts, addContact, removeContact, getInitials };