import React, { useState, useContext } from "react";
import Logo from "../assets/logo.svg";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { TbListDetails } from "react-icons/tb";
import { IoLogInOutline, IoLogOutOutline } from "react-icons/io5";
import { HiOutlineUserAdd } from "react-icons/hi";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { FaRegSmileBeam } from "react-icons/fa"; // 👈 for Face Attendance icon
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header>
      <div className="container">
        <div className="menus">
          <Link to={"/"}>
            <img src={Logo} alt="Logo" />
          </Link>

          <nav>
            <ul className={isOpen ? "display" : ""}>
              <div className="btn" onClick={() => setIsOpen(false)}>
                <i className="fas fa-times close-btn"></i>
              </div>

              {/* ✅ For all logged-in users (Overview visible) */}
              {user && (
                <li>
                  <NavLink to={"/"}>
                    <div className="nav-item">
                      <TbListDetails className="nav-icn" /> Overview
                    </div>
                  </NavLink>
                </li>
              )}

              {/* ✅ For employees only — Face Attendance and Face Registration */}
              {user?.role === "employee" && (
                <>
                  <li>
                    <NavLink to={"/face-attendance"}>
                      <div className="nav-item">
                        <FaRegSmileBeam className="nav-icn" /> Face Attendance
                      </div>
                    </NavLink>
                  </li>

                  {/* Optional: Face registration page (if you have a separate route for face data setup) */}
                  <li>
                    <NavLink to={"/register-face"}>
                      <div className="nav-item">
                        <FaRegSmileBeam className="nav-icn" /> Register Face
                      </div>
                    </NavLink>
                  </li>
                </>
              )}

              {/* ✅ For admin only — Admin Dashboard */}
              {user?.role === "admin" && (
                <li>
                  <NavLink to={"/admin"}>
                    <div className="nav-item">
                      <MdOutlineAdminPanelSettings className="nav-icn" /> Admin
                    </div>
                  </NavLink>
                </li>
              )}

              {/* ✅ Login/Register or Logout */}
              {!user ? (
                <>
                  <li>
                    <NavLink to={"/login"}>
                      <div className="nav-item">
                        <IoLogInOutline className="nav-icn" /> Login
                      </div>
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to={"/register"}>
                      <div className="nav-item">
                        <HiOutlineUserAdd className="nav-icn" /> Register
                      </div>
                    </NavLink>
                  </li>
                </>
              ) : (
                <li>
                  <button className="logout-btn" onClick={handleLogout}>
                    <IoLogOutOutline className="nav-icn" /> Logout
                  </button>
                </li>
              )}
            </ul>
          </nav>

          <div className="btn" onClick={() => setIsOpen(true)}>
            <i className="fas fa-bars menu-btn"></i>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
