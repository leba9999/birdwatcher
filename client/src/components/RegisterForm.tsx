import React, {useContext, useRef, useState} from 'react';
import classes from './RegisterForm.module.css'
import Form from 'react-bootstrap/Form';
import {Button, Modal} from "react-bootstrap";
import LoadingLayout from "./LoadingLayout";
import { useNavigate } from 'react-router-dom';

const RegisterForm = () => {
    const navigate = useNavigate(); 

    const [registerError, setRegisterError] = useState(false);
    const [errorText, setErrorText] = useState("");
    const [passwordMatchError, setPasswordMatchError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [show, setShow] = useState(false);
    const pattern = "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z0-9._%+-]+$";

    const [validated, setValidated] = useState(false);
    const formRef = useRef<HTMLFormElement | null>(null);
    const usernameRef = useRef<HTMLInputElement | null>(null);
    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const rePasswordRef = useRef<HTMLInputElement | null>(null);

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
            const email = emailRef.current?.value;
            const password = passwordRef.current?.value;
            const repassword = rePasswordRef.current?.value;
            if(password !== repassword){
                setPasswordMatchError(true);
                setLoading(false);
                return;
            }
            if(username && password){
                fetch('https://sssf-birdwatcher.azurewebsites.net/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: `mutation Register($user: UserInput!) {
                          register(user: $user) {
                            message
                            user {
                              id
                              email
                              username
                            }
                          }
                        }`,
                        variables: {
                          user: {
                            username: username,
                            email: email,
                            password: password,
                          },
                        },
                      })
                }).then(async response => {
                    const resJson = await response.json();
                    if(!resJson.errors){
                        handleShow();
                    }else{
                        throw new Error('Dubplicate username or email!');
                    }
                }).catch((error) => {
                    console.error('Error:', error);
                    setErrorText(error.message);
                    setRegisterError(true);
                }).finally(() => {
                    setLoading(false);
                });
            }
        }

    }
    function handleCancel(){
        navigate(`/login`);
    }
    function handleClose(){
        setShow(false);
        navigate(`/login`);
    }
    function handleShow(){
        setShow(true);
    }
    return (
        <>
            {
                loading ? <LoadingLayout/> : null
            }
            <Form ref={formRef} className={classes.Form} noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className={classes.formGroup} controlId="formBasicUsername">
                    <Form.Label>Username</Form.Label>
                    <Form.Control className={registerError ? `${classes.formInput} ${classes.invalid}` : `${classes.formInput}`} autoComplete={"username"} required type="text" placeholder="Enter username" ref={usernameRef} />
                    <Form.Control.Feedback>Username is valid</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                        Username is invalid!
                    </Form.Control.Feedback>
                    {registerError ? <Form.Text className={classes.invalidText}>
                        {errorText}
                    </Form.Text> : null}
                </Form.Group>
                <Form.Group className={classes.formGroup} controlId="formBasicEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control className={registerError ? `${classes.formInput} ${classes.invalid}` : `${classes.formInput}`} autoComplete={"email"} pattern={pattern} required type="email" placeholder="Enter email" ref={emailRef} />
                    <Form.Control.Feedback>Email is valid</Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                        Email is invalid!
                    </Form.Control.Feedback>
                    {registerError ? <Form.Text className={classes.invalidText}>
                        {errorText}
                    </Form.Text> : null}
                </Form.Group>
                <Form.Group className={classes.formGroup} controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control className={ passwordMatchError ? `${classes.formInput} ${classes.invalid}` : `${classes.formInput}`} autoComplete={"current-password"} required type="password" placeholder="Password" ref={passwordRef} />
                    <Form.Control.Feedback type="invalid">
                        Password is required!
                    </Form.Control.Feedback>
                    {passwordMatchError ? <Form.Text className={classes.invalidText}>
                        Passwords does not match!
                    </Form.Text> : null}
                </Form.Group>
                <Form.Group className={classes.formGroup} controlId="formBasicRePassword">
                    <Form.Label>Password Again</Form.Label>
                    <Form.Control className={ passwordMatchError ? `${classes.formInput} ${classes.invalid}` : `${classes.formInput}`} autoComplete={"current-password"} required type="password" placeholder="Re Password" ref={rePasswordRef} />
                    <Form.Control.Feedback type="invalid">
                        Password is required!
                    </Form.Control.Feedback>
                    {passwordMatchError ? <Form.Text className={classes.invalidText}>
                        Passwords does not match!
                    </Form.Text> : null}
                </Form.Group>
                <div>
                    <Button className={classes.formButton} variant="primary" type="submit">
                        Register
                    </Button>
                    <Button className={classes.formButton} variant="danger" type="button" onClick={handleCancel}>
                        Cancel
                    </Button>
                </div>
            </Form>
            <Modal dialogClassName="myModal" size="lg" show={show} onHide={handleClose}>
                <Modal.Header>
                    <Modal.Title>User registered</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>User registered successfully! Now login with your new account</p>
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

export default RegisterForm;