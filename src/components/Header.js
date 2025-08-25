import React from "react";
import logo from "../assets/images/logo.png";
import capture from "../assets/images/capture-svgrepo-com.png";
import language from "../assets/images/language-svgrepo-com.png";
import notefications from "../assets/images/Component 44 – 1.png";

const Header = () => {
  return (
    <div className="header">
      <img src={logo} alt="Logo" className="logo" />
      <div className="headerData">
        <div className="headerData_icons">
          <img src={capture} alt="Logo" className="headerData_icons_icon" />
          <img src={language} alt="Logo" className="headerData_icons_icon" />
          <img
            src={notefications}
            alt="Logo"
            className="headerData_icons_icon"
          />
        </div>
        <span className="seperator" />
        <div className="headerData_info">
          <h3>
            Hello, <span style={{ fontWeight: "bold" }}>Sameer Twal</span>
          </h3>
          <h4>Technical Support</h4>
        </div>
      </div>
    </div>
  );
};

export default Header;
