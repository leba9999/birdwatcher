import { useContext, useEffect, useRef, useState } from "react";
import LoadingLayout from "../components/LoadingLayout";
// TODO: own css file
import classes from "./Profile.module.css";
import { UserContext } from "../util/UserContext";
import { InputUser, User } from "../Interfaces/User";
import { Post } from "../Interfaces/Post";
import Form from 'react-bootstrap/Form';
import {Button, Modal} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Dropzone from "../components/dropzone";
import UploadMessageResponse from "../Interfaces/UploadMessageResponse";

function EditProfile() {
  const userFromContext = useContext(UserContext);
  const navigate = useNavigate(); 

  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [registerError, setRegisterError] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [passwordMatchError, setPasswordMatchError] = useState(false);

  const pattern = "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z0-9._%+-]+$";

  const [validated, setValidated] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const rePasswordRef = useRef<HTMLInputElement | null>(null);
  
  const [email, setEmail] = useState("");
  
  async function createFileFromLink(link: string, filename: string): Promise<File> {
    const response = await fetch(link);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
  }
  useEffect(()=>{
    setLoading(true);
    fetch('http://localhost:5000/graphql', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `query UserById($userByIdId: ID!) {
          userById(id: $userByIdId) {
            createdAt
            email
            id
            username
            filename
          }
        }`,
        variables: {
          userByIdId: userFromContext?.user!.user.id
        },
      })
    }).then(async response => {
      const resJson = (await response.json()).data.userById as unknown as User;
      if(resJson){
        console.log(resJson);
        setUserData(resJson);
        setEmail(resJson.email);
        if(resJson.filename !== "profile"){
          const newFile = await createFileFromLink(`http://localhost:5000/uploads/${resJson.filename}`, resJson.filename as string);
          setSelectedFile(newFile);
        }
      }
    }).catch((error) => {
      console.error('Error:', error);
    }).finally(() => {
      setLoading(false);
    });
  },[])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>){
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
        const email = emailRef.current?.value;
        const password = passwordRef.current?.value;
        const repassword = rePasswordRef.current?.value;
        if(password !== repassword){
            setPasswordMatchError(true);
            setLoading(false);
            return;
        }
        const updatedUserData : InputUser = {};
        const formData = new FormData();
        if(selectedFile && !selectedFile.name.includes(userData?.filename as string)){
          console.log(selectedFile.name)
          console.log(userData?.filename as string)
          formData.append('bird', selectedFile);
          const uploadResponse = await fetch('http://localhost:5000/api/v1/upload', {
              method: 'POST',
              headers: {
                  'Authorization':  `Bearer ${userFromContext?.user?.token}`,
              },
              body: formData
          });
          const uploadData = await uploadResponse.json() as unknown as UploadMessageResponse;
          updatedUserData.filename = uploadData.data.filename;
        } else {
          updatedUserData.filename = "profile";
        }
        if(email?.length !== 0){
          updatedUserData.email = email;
        }
        if(password?.length !== 0){
          updatedUserData.password = password;
        }
        fetch('http://localhost:5000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization':  `Bearer ${userFromContext?.user?.token}`,
            },
            body: JSON.stringify({
              query: `mutation UpdateUser($user: UserModify!) {
                updateUser(user: $user) {
                  message
                  user {
                    email
                    username
                    id
                  }
                }
              }`,
                variables: {
                  user: {
                    ...updatedUserData
                  },
                },
              })
        }).then(async response => {
            const resJson = await response.json();
            if(!resJson.errors){
                console.log(resJson);
                navigate(`/profile`);
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
  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
      setSelectedFile(null);
  };
  function handleCancel(){
      navigate(`/profile`);
  }
  function handleDelete(){
    fetch('http://localhost:5000/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization':  `Bearer ${userFromContext?.user?.token}`,
        },
        body: JSON.stringify({
          query: `mutation DeleteUser {
            deleteUser {
              message
              user {
                id
                username
                email
              }
            }
          }`,
          })
    }).then(async response => {
        const resJson = await response.json();
        if(!resJson.errors){
          localStorage.removeItem('user');
          userFromContext?.setUser(null);
          navigate(`/login`);
        }else{
            throw new Error('Something went wrong!');
        }
    }).catch((error) => {
        console.error('Error:', error);
        setErrorText(error.message);
    }).finally(() => {
        setLoading(false);
    });
  }
  function handleInput(){
    setEmail(emailRef.current!.value);
  }

  function handleShow(){
      setShow(true);
  }
  function handleClose(){
      setShow(false);
  }
  return (
    <>
      {
          loading ? <LoadingLayout/> : null
      }
      <div className={classes.box}>
        <Form ref={formRef} className={classes.Form} noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className={classes.formGroup}  controlId="formBasicFile">
            {
                selectedFile ? 
                <>
                    <img className={classes.imagePreview} src={URL.createObjectURL(selectedFile)} alt="preview" />
                    <Button variant='danger' onClick={handleRemoveFile}>Remove</Button>
                </>
                :
                <div className={`${classes.dropzone}`}>
                  <Dropzone onFileUpload={handleFileUpload} />
              </div>
            }
          </Form.Group>
          <Form.Group className={classes.formGroup} controlId="formBasicEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control className={registerError ? `${classes.formInput} ${classes.invalid}` : `${classes.formInput}`} autoComplete={"email"} pattern={pattern} value={email} onChange={handleInput} type="email" placeholder="Enter email" ref={emailRef} />
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
              <Form.Control className={ passwordMatchError ? `${classes.formInput} ${classes.invalid}` : `${classes.formInput}`} autoComplete={"current-password"} type="password" placeholder="Password" ref={passwordRef} />
              {passwordMatchError ? <Form.Text className={classes.invalidText}>
                  Passwords does not match!
              </Form.Text> : null}
          </Form.Group>
          <Form.Group className={classes.formGroup} controlId="formBasicRePassword">
              <Form.Label>Password Again</Form.Label>
              <Form.Control className={ passwordMatchError ? `${classes.formInput} ${classes.invalid}` : `${classes.formInput}`} autoComplete={"current-password"} type="password" placeholder="Re Password" ref={rePasswordRef} />
              {passwordMatchError ? <Form.Text className={classes.invalidText}>
                  Passwords does not match!
              </Form.Text> : null}
          </Form.Group>
          <div>
              <Button className={classes.formButton} variant="primary" type="submit">
                  Update
              </Button>
              <Button className={classes.formButton} variant="warning" type="button" onClick={handleCancel}>
                  Cancel
              </Button>
          </div>
          <h3>Delete account!</h3>
          <Button className={classes.formButton} variant="danger" type="button" onClick={handleShow}>
              Delete account
          </Button>
        </Form>
      </div>
      <Modal dialogClassName="myModal" size="lg" show={show} onHide={handleClose}>
          <Modal.Header>
              <Modal.Title>Are you sure?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <p>Are you sure you wanna permanently delete your account?</p>
          </Modal.Body>
          <Modal.Footer>
              <Button className="close" variant="danger" onClick={handleDelete}>
                  Delete
              </Button>
              <Button className="close" variant="primary" onClick={handleClose}>
                  Close
              </Button>
          </Modal.Footer>
      </Modal>
    </>
  );
}
  
export default EditProfile;
  