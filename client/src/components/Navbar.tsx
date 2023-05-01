
import "./navbar.css"
import {useContext, useState} from 'react';
import {UserContext} from "../util/UserContext";
import {Link} from "react-router-dom";
import classes from "./Navbar.module.css";

const Navi=()=> {
    const userFromContext = useContext(UserContext);
    const [show, setShow] = useState(false);

    let username = userFromContext?.user?.user.username;
    console.log(userFromContext)
    const logout = ()=> {
        userFromContext?.setUser(null);
        localStorage.removeItem('user');
    }
  return (
      <nav id='nav'>
          <Link className="head" to="/">
          <i className="fa-solid fa-crow">
              </i>
          </Link>
          <div className="burger">
                <div>
                    <div onClick={()=>setShow(!show)} className={show ? `${classes.menu} ${classes.open}` : `${classes.menu}`}>
                        <div className={classes.burger}>
                        </div>
                    </div>
                    <div className={show ? `${classes.sideNav} ${classes.sideNavOpen}` : `${classes.sideNav}`}>
                        <Link className="bm-item" to="/">
                            <i className="fa-solid fa-house burgericons"></i>
                            Home
                        </Link>
                        <Link  className="bm-item" to="/post">
                            <i className="fa-solid fa-arrow-up-from-bracket burgericons"></i>
                            Post
                        </Link>
                        <div className="bm-item" >
                            <li className={"nav_submenu"}>
                                <a>
                                    <i className="fa-solid fa-user burgericons"></i> 
                                    {username}
                                </a>
                                <ul>
                                    <li className="nav_submenu-item ">
                                        <Link to={"/profile"} className="navlink">Profile</Link>
                                    </li>
                                    <li className="nav_submenu-item ">
                                        <Link className="navlink" to="/login" onClick={logout}>
                                            Logout
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                        </div>
                    </div>
                    {
                        show ? <div onClick={()=>setShow(false)} className={classes.overlay}></div> : null
                    }
                </div>
          </div>
          <ul className="navbar">
              <li>
                  <Link className="navlink" to="/">
                      <i className="fa-solid fa-house navbaricons"></i>
                      Home
                  </Link>
              </li>
              <li>
                  <Link  className="navlink" to="/post">
                    <i className="fa-solid fa-arrow-up-from-bracket navbaricons"></i>
                      Post
                  </Link>
              </li>
              <li className={"nav_submenu"}>
                  <a className="navlink" >
                    <i className="fa-solid fa-user navbaricons"></i>
                    {username}
                    </a>
                    <ul>
                        <li className="nav_submenu-item ">
                            <Link to={"/profile"} className="navlink">Profile</Link>
                        </li>
                        <li className="nav_submenu-item ">
                            <Link className="navlink" to="#" onClick={logout}>
                                Logout
                            </Link>
                        </li>
                    </ul>
              </li>
        </ul>
      </nav>
  )
}

export default Navi;
