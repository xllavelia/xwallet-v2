import { authFetch } from "./apiClient";

var AVATAR_PALETTE = ["#5B8C7B", "#C97B63", "#6E7FD1", "#B98B4E", "#8B6FA8", "#4F8FA3"];

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

async function searchUsers(query) {
  if (!query || query.length === 0) return [];
  var res = await authFetch("/users/search?q=" + encodeURIComponent(query));
  return (res || []).map(decorate);
}

async function listContacts() {
  var res = await authFetch("/contacts/list");
  return (res || []).map(function (c) {
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

export { searchUsers, listContacts, addContact, getInitials };