import { useState } from "react";
import classes from "./Login.module.css";
import LoginForm from "../components/LoginForm";
import { Link } from "react-router-dom";

function Login() {
    const [show, setShow] = useState(true);

  return (
    <div className={classes.loginBox}>
    <h2>Login</h2>
    <LoginForm/>
</div>
  );
}

export default Login;
