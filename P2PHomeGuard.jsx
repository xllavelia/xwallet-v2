import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";

function P2PHomeGuard() {
  var location = useLocation();
  var navigate = useNavigate();
  var navType = useNavigationType();
  var depthRef = useRef(0);

  useEffect(function () {
    var isP2P = location.pathname.startsWith("/p2p");

    if (navType === "POP") {
      if (depthRef.current > 0) depthRef.current -= 1;
    } else if (isP2P) {
      depthRef.current += 1;
    } else {
      depthRef.current = 0;
    }

    if (location.pathname === "/" && depthRef.current > 0) {
      var depth = depthRef.current;
      depthRef.current = 0;
      navigate(-depth);
    }
  }, [location.pathname, navType]);

  return null;
}

export default P2PHomeGuard;