var state = {
  query: "",
  mode: "id",
  results: [],
  selectedContact: null
};

function getSendSearchState() {
  return state;
}
function setSendSearchState(patch) {
  state = Object.assign({}, state, patch);
}

export { getSendSearchState, setSendSearchState };