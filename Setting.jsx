import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { resetAll } from './useBalance';



const Setting = () => {
 const navigate = useNavigate();

const roadHome = () => {
    navigate("/");
  };
  // Имитация данных пользователя
  const user = {
    nickname: "xlavelia",
    id: "0x882...fa11",
    avatarInitial: "X"
  };
  
  
    const toggleNotifications = () => {
      setNotifications(!notifications);
    };

     const [notifications, setNotifications] = useState(true);
  

  
  return (<div className="SettingContent">
    
<div className="Road-Home" onClick={roadHome}></div>

 <div className="settings-layout">
      
      <header className="settings-header">
        <h1 className="settings-title">Setting</h1>
      </header>

      <section className="profile-section">
        <div className="profile-card-glass">
          <div className="profile-avatar-large">
            {user.avatarInitial}
          </div>
          <div className="profile-info">
            <h2 className="profile-nickname">{user.nickname}</h2>
            <div className="profile-id-box">
              <span className="id-label">ID:</span>
              <span className="id-value">{user.id}</span>
              <button className="btn-copy">Copy</button>
            </div>
          </div>
        </div>
      </section>

      <section className="settings-menu-block">
        
        <div className="menu-item-row">
          <div className="menu-item-left">
            <div className="menu-icon-box"></div>
            <span className="menu-text">Account Details</span>
          </div>
          <div className="menu-item-right">›</div>
        </div>

   <div className="menu-item-row">
          <div className="menu-item-left">
            <div className="menu-icon-box"></div>
            <span className="menu-text">Confidentality</span>
          </div>
          <div className="menu-item-right">›</div>
        </div>


        <div className="menu-item-row">
          <div className="menu-item-left">
            <div className="menu-icon-box"></div>
            <span className="menu-text">Invite Frends</span>
          </div>
          <div className="menu-item-right">
            <span className="menu-badge">bonus</span>
            <span>›</span>
          </div>
        </div>

        <div className="menu-item-row" onClick={toggleNotifications}>
          <div className="menu-item-left">
            <div className="menu-icon-box"></div>
            <span className="menu-text">notification PUSH</span>
          </div>
          <div className="menu-item-right">
            <div className={"custom-toggle " + (notifications ? "toggle-on" : "toggle-off")}>
              <div className="toggle-knob"></div>
            </div>
          </div>
        </div>

      </section>

      <footer className="settings-footer">
        <div className="footer-links">
          <div className="footer-link-item">Contact Information</div>
          <div className="footer-link-item" onClick={resetAll}>Privacy Policy</div>
          <div className="footer-link-item">Terms Of Use</div>
        </div>
        
        <div className="app-version-info">
          <span>xwallet</span>
          <span className="version-number" >v.1.0.0</span>
        </div>
      </footer>

    </div>


</div>);
};

export default Setting;