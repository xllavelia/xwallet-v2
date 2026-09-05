import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStatus } from "./AuthStatusContext";

var TAB_ROUTES = ["/", "/services", "/profile"];
function HomeIcon(p) { return (<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5h-8q-1.775 0-2.887 1.113T9 9v6q0 1.775 1.113 2.888T13 19h8q0 .825-.587 1.413T19 21zm8-4q-.825 0-1.412-.587T11 15V9q0-.825.588-1.412T13 7h7q.825 0 1.413.588T22 9v6q0 .825-.587 1.413T20 17zm4.075-3.925Q17.5 12.65 17.5 12t-.425-1.075T16 10.5t-1.075.425T14.5 12t.425 1.075T16 13.5t1.075-.425"/></svg>); }
function ServicesIcon(p) { return (<svg width="24" height="24" viewBox="0 0 24 24" fill={p.active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7.5" height="7.5" rx="1.8"></rect><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.8"></rect><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.8"></rect><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.8"></rect></svg>); }
function ProfileIcon(p) { return (<svg width="24" height="24" viewBox="0 0 24 24" fill={p.active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"></circle><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"></path></svg>); }

var TABS = [
  { path: "/", label: "Home", Icon: HomeIcon },
  { path: "/services", label: "Services", Icon: ServicesIcon },
  { path: "/profile", label: "Profile", Icon: ProfileIcon }
];

function BottomNav() {
  var location = useLocation();
  var navigate = useNavigate();
  var { status } = useAuthStatus();

  var isTabRoute = TAB_ROUTES.indexOf(location.pathname) !== -1;
  var shouldShow = isTabRoute && status === "authed";

  var activeIndex = TABS.findIndex(function (t) { return t.path === location.pathname; });
  if (activeIndex === -1) activeIndex = 0;

  if (!shouldShow) {
    return null;
  }

  var indicatorTransform = "translateX(" + (activeIndex * 100) + "%)";

  return (
    <nav className="bnav-wrap">
      <div className="bnav-pill">
        <div className="bnav-indicator-track" style={{ width: (100 / TABS.length) + "%" }}>
          <div className="bnav-indicator" style={{ transform: indicatorTransform }}></div>
        </div>
        {TABS.map(function (tab, idx) {
          var isActive = idx === activeIndex;
          return (
            <button key={tab.path} className={"bnav-item " + (isActive ? "active" : "")} onClick={() => navigate(tab.path)}>
              <tab.Icon active={isActive} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;