import React, { createContext, useContext, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";

const AuthStatusContext = createContext({ status: "checking", setStatus: function () {}, reducedMotion: false });

function AuthStatusProvider(props) {
  var [status, setStatus] = useState("checking");
  const [reducedMotion, setReducedMotion] = useState(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches || localStorage.getItem("xw-reduce-motion") === "1"
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const reduced = media.matches || localStorage.getItem("xw-reduce-motion") === "1";
      document.documentElement.classList.toggle("xw-reduce-motion", reduced);
      setReducedMotion(reduced);
    };
    update();
    media.addEventListener("change", update);
    window.addEventListener("xw-preferences-changed", update);
    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("xw-preferences-changed", update);
    };
  }, []);
  return (
    <AuthStatusContext.Provider value={{ status, setStatus, reducedMotion }}>
      <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>
        {props.children}
      </MotionConfig>
    </AuthStatusContext.Provider>
  );
}

function useAuthStatus() {
  return useContext(AuthStatusContext);
}

export { AuthStatusProvider, useAuthStatus };