import classes from "./Login.module.css";
import LoginForm from "../components/LoginForm";

function Login() {
  return (
    <div className={classes.loginBox}>
    <h2>Login</h2>
    <LoginForm/>
</div>
  );
}

export default Login;
