import React, {useContext, useRef, useState} from 'react';
import classes from './PostForm.module.css';
import Form from 'react-bootstrap/Form';
import {Button} from "react-bootstrap";
import LoadingLayout from "./LoadingLayout";
import {UserContext} from "../util/UserContext";
import Dropzone from './dropzone';
import UploadMessageResponse from '../Interfaces/UploadMessageResponse';
import { useNavigate } from 'react-router-dom';

function NewPost() {
    
    const userFromContext = useContext(UserContext);

    const navigate = useNavigate(); 
    const [loading, setLoading] = useState(false);

    const [uploadError, setUploadError] = useState(false);

    const descMaxLength=500;
    const [desc, setDesc] = useState("");

    const [validated, setValidated] = useState(false);
    const formRef = useRef<HTMLFormElement | null>(null);
    const descRef = useRef<HTMLTextAreaElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
            if(!selectedFile){
                setUploadError(true);
                setLoading(false);
                return;
            }
            const formData = new FormData();
            formData.append('bird', selectedFile);
            const uploadResponse = await fetch('http://localhost:5000/api/v1/upload', {
                method: 'POST',
                headers: {
                    'Authorization':  `Bearer ${userFromContext?.user?.token}`,
                },
                body: formData
            });
            const uploadData = await uploadResponse.json() as unknown as UploadMessageResponse;
            if(uploadData.data){
                fetch('http://localhost:5000/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization':  `Bearer ${userFromContext?.user?.token}`,
                    },
                    body: JSON.stringify({
                        query: `mutation CreatePost($owner: ID!, $filename: String!, $description: String) {
                            createPost(owner: $owner, filename: $filename, description: $description) {
                              id
                              status
                              title
                              description
                              owner {
                                id
                              }
                              createdAt
                              filename
                            }
                          }`,
                        variables: {
                          owner: userFromContext?.user?.user.id,
                          filename: uploadData.data.filename,
                          description: descRef.current?.value as string,
                        },
                      })
                }).then(async response => {
                    const resJson = await response.json();
                    console.log(resJson);
                    if(!resJson.errors){
                        navigate("/"+resJson.data.createPost.id);
                    }else{
                        throw new Error('Dubplicate username or email!');
                    }
                }).catch((error) => {
                    console.error('Error:', error);
                    setUploadError(true);
                }).finally(() => {
                    setLoading(false);
                });
            }
        }
    }

    const handleFileUpload = (file: File) => {
      setSelectedFile(file);
      setUploadError(false);
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
    };

    const handleInput = () =>{
        setDesc(descRef.current?.value as string)
    }
    return (
      <>
        {
            loading ? <LoadingLayout/> : null
        }
        <Form ref={formRef} className={classes.Form} noValidate validated={validated} onSubmit={handleSubmit}>
        <Form.Group className={classes.formGroup}  controlId="formBasicFile">
            {
                selectedFile ? 
                <>
                    <img className={classes.imagePreview} src={URL.createObjectURL(selectedFile)} alt="preview" />
                    <Button variant='danger' onClick={handleRemoveFile}>Remove</Button>
                </>
                :
                <div className={`${classes.dropzone} ${uploadError ? classes.invalid : '' } `}>
                   <Dropzone onFileUpload={handleFileUpload} />
               </div>
            }
            {uploadError ? <Form.Text className={classes.invalidText}>
                Image is required!
            </Form.Text> : null}
          </Form.Group>
            
            <Form.Group className={classes.formGroup} controlId="formBasicDesc">
                <Form.Label className={classes.text}>Description</Form.Label>
                <Form.Control className={`${classes.formTextArea} ${classes.formInput}`} name="desc" maxLength={descMaxLength} as="textarea" type="text" placeholder="Enter description" value={desc} onChange={handleInput} ref={descRef} />
                <Form.Text className={classes.text}>{desc.length}/{descMaxLength}</Form.Text>
            </Form.Group>
            <Button className={classes.formButton} variant="primary" type="submit">
                Post
            </Button>
        </Form>
      </>
    );
  }
  
  export default NewPost;
  