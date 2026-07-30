
var MOCK_CONTACTS = [
  { id: "DBECH", name: "Xlavelia Laga",      color: "hsl(61, 85%, 78%)" },
  { id: "5SEI1", name: "Jonah Park",     color: "hsl(61, 85%, 78%)" },
  { id: "K3RZX", name: "Aiko Tanaka",    color: "hsl(61, 85%, 78%)" },
  { id: "QW7T9", name: "Lucas Ferreira", color: "hsl(61, 85%, 78%)" },
  { id: "M02VB", name: "Sasha Ivanova",  color: "hsl(61, 85%, 78%)" },
  { id: "7XLM2", name: "Theo Brandt",    color: "hsl(61, 85%, 78%)" }
];

function getInitials(name) {
  var parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function searchContacts(query) {
  var q = query.trim().toUpperCase();
  return new Promise(function (resolve) {
    setTimeout(function () {
      if (q.length === 0) {
        resolve(MOCK_CONTACTS.slice(0, 4));
        return;
      }
      var results = MOCK_CONTACTS.filter(function (c) {
        return c.id.indexOf(q) !== -1 || c.name.toUpperCase().indexOf(q) !== -1;
      });
      resolve(results);
    }, 260);
  });
}

export { MOCK_CONTACTS, searchContacts, getInitials };