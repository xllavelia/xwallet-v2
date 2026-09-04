import { useState, useEffect } from "react";
import { authFetch } from "./apiClient";

function useHomeSummary() {
  var [summary, setSummary] = useState(null);
  useEffect(function () {
    authFetch("/home/summary").then(setSummary).catch(function () {});
  }, []);
  return summary;
}

export { useHomeSummary };