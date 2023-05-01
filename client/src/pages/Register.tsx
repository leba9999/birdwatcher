import RegisterForm from "../components/RegisterForm";
import classes from "./Login.module.css";

function Register() {

    return (
        <div className={classes.loginBox}>
        <h2>Register</h2>
        <RegisterForm/>
    </div>
    );
  }
  
  export default Register;
  