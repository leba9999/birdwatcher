import React, {useContext, useRef, useState} from 'react';
import classes from './LoginForm.module.css'
import Form from 'react-bootstrap/Form';
import {Button, Modal} from "react-bootstrap";
import LoadingLayout from "./LoadingLayout";
import {UserContext} from "../util/UserContext";
import { TokenUser } from '../Interfaces/User';
import LoginMessageResponse from '../Interfaces/LoginMessageResponse';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const userFromContext = useContext(UserContext);
    const navigate = useNavigate(); 

    const [loginError, setLoginError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);

    const [validated, setValidated] = useState(false);
    const formRef = useRef<HTMLFormElement | null>(null);
    const usernameRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);

    function handleSubmit(event: React.FormEvent<HTMLFormElement>){
        const form = formRef.current;
        if(!event){
            return;
        }
        event.preventDefault();
        if(form){
            if (form.checkValidity() === false) {
                setValidated(true);
                return;
            }
            setValidated(false);
            setLoading(true);
            const username = usernameRef.current?.value;
            const password = passwordRef.current?.value;
            if(username && password){
                fetch('https://sssf-birdwatcher.azurewebsites.net/api/v1/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                }).then(response => {
                    if(response.ok){
                        return response.json() as unknown as LoginMessageResponse;
                    }else{
                        throw new Error('Something went wrong');
                    }
                }).then(data => {
                    delete data.message;
                    if(data){
                        userFromContext?.setUser(data as TokenUser);
                        localStorage.setItem('user', JSON.stringify(data));
                    }
                }).catch((error) => {
                    console.error('Error:', error);
                    setLoginError(true);
                }).finally(() => {
                    setLoading(false);
                    navigate('/');
                });
            }
        }

    }

    function handleClose(){
        setShow(false);
    }
    return (
        <>
            {
                loading ? <LoadingLayout/> : null
            }
            <Form ref={formRef} className={classes.Form} noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className={classes.formGroup} controlId="formBasicUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control className={loginError ? `${classes.formInput} ${classes.invalid}` : `${classes.formInput}`} autoComplete={"username"} required type="text" placeholder="Enter username" ref={usernameRef} />
                    <Form.Control.Feedback>Username is valid</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                        Username is invalid!
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className={classes.formGroup} controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control className={loginError ? `${classes.formInput} ${classes.invalid}` : `${classes.formInput}`} autoComplete={"current-password"} required type="password" placeholder="Password" ref={passwordRef} />
                    <Form.Control.Feedback type="invalid">
                        Password is required!
                    </Form.Control.Feedback>
                    {loginError ? <Form.Text className={classes.invalidText}>
                        Password or email incorrect!
                    </Form.Text> : null}
                </Form.Group>
                <p>not yet registered? <Link to={"/register"}> Register here!</Link> </p>
                <Button className={classes.formButton} variant="primary" type="submit">
                    Login
                </Button>
            </Form>
            <Modal dialogClassName="myModal" size="lg" show={show} onHide={handleClose}>
                <Modal.Header>
                    <Modal.Title>Id: </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="close" variant="primary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default LoginForm;