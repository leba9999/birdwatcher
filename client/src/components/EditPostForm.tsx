import React, {useContext, useEffect, useRef, useState} from 'react';
import classes from './EditPostForm.module.css';
import Form from 'react-bootstrap/Form';
import {Button} from "react-bootstrap";
import LoadingLayout from "./LoadingLayout";
import {UserContext} from "../util/UserContext";
import Dropzone from './dropzone';
import UploadMessageResponse from '../Interfaces/UploadMessageResponse';
import { Post } from '../Interfaces/Post';
import { useNavigate } from 'react-router-dom';

type Props = {
  post : Post;
  reload : () => void;
};

function EditPostForm({ post, reload } : Props) {

    const userFromContext = useContext(UserContext);
    const navigate = useNavigate(); 
    
    if(post.owner.id !== userFromContext?.user?.user.id){
        navigate('/');  
    }

    const [loading, setLoading] = useState(false);

    const [uploadError, setUploadError] = useState(false);

    const descMaxLength=500;
    const [desc, setDesc] = useState(post.description as string);
    const [title, setTitle] = useState(post.title as string);
    const [status, setStatus] = useState<boolean>(post.status as boolean);

    const [validated, setValidated] = useState(false);
    const formRef = useRef<HTMLFormElement | null>(null);
    const descRef = useRef<HTMLTextAreaElement | null>(null);
    const titleRef = useRef<HTMLInputElement | null>(null);
    const statusRef = useRef<HTMLInputElement | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    async function createFileFromLink(link: string, filename: string): Promise<File> {
        const response = await fetch(link);
        const blob = await response.blob();
        return new File([blob], filename, { type: blob.type });
      }

    useEffect(() => {
        (async ()=>{
            const newFile = await createFileFromLink(`https://sssf-birdwatcher.azurewebsites.net/uploads/${post.filename}`, post.filename as string);
            setSelectedFile(newFile);
        })();
    }, []);
    
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
            const updatedPost = post;
            if(selectedFile && !selectedFile.name.includes(updatedPost?.filename as string)){
                const formData = new FormData();
                formData.append('bird', selectedFile);
                const uploadResponse = await fetch('https://sssf-birdwatcher.azurewebsites.net/api/v1/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization':  `Bearer ${userFromContext?.user?.token}`,
                    },
                    body: formData
                });
                const uploadData = await uploadResponse.json() as unknown as UploadMessageResponse;
                updatedPost.filename = uploadData.data.filename;
            }
            updatedPost.description = desc;
            updatedPost.status = status;
            updatedPost.title = titleRef.current?.value as string;

            console.log(post);
            console.log(updatedPost);

            if(updatedPost){
                fetch('https://sssf-birdwatcher.azurewebsites.net/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization':  `Bearer ${userFromContext?.user?.token}`,
                    },
                    body: JSON.stringify({
                        query: `mutation UpdatePost($updatePostId: ID!, $status: Boolean, $title: String, $description: String, $filename: String) {
                            updatePost(id: $updatePostId, status: $status, title: $title, description: $description, filename: $filename) {
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
                          ...updatedPost,
                          updatePostId: updatedPost.id,
                        },
                      })
                }).then(async response => {
                    const resJson = await response.json();
                    console.log(resJson);
                    if(!resJson.errors){
                        //handleShow();
                    }else{
                        throw new Error('Dubplicate username or email!');
                    }
                }).catch((error) => {
                    console.error('Error:', error);
                    setUploadError(true);
                }).finally(() => {
                    setLoading(false);
                    navigate(-1)
                });
            }
        }
    }

    function handleDelete(){
        fetch('https://sssf-birdwatcher.azurewebsites.net/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization':  `Bearer ${userFromContext?.user?.token}`,
                    },
                    body: JSON.stringify({
                        query: `mutation DeletePost($deletePostId: ID!) {
                          deletePost(id: $deletePostId) {
                            id
                          }
                        }`,
                        variables: {
                          deletePostId: post.id,
                        },
                      })
                }).then(async response => {
                    const resJson = await response.json();
                    console.log(resJson);
                }).catch((error) => {
                    console.error('Error:', error);
                }).finally(() => {
                    setLoading(false);
                    navigate('/');
                });
    }

    const handleFileUpload = (file: File) => {
      setSelectedFile(file);
      setUploadError(false);
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
    };

    const handleInput = () =>{
        setDesc(descRef.current?.value as string);
    }
    const handleTitleInput = () =>{
        setTitle(titleRef.current?.value as string);
    }
    const handleStatusInput = () =>{
        setStatus(statusRef.current?.checked as boolean);
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
                        Image: {selectedFile.name} <Button variant='danger' size='sm' onClick={handleRemoveFile}>Remove</Button>
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
            
            <Form.Group className={classes.formGroup} controlId="formBasicStatus">
                <Form.Label className={classes.text}>Status: </Form.Label>
                <Form.Check type="switch"id="custom-switch" className={classes.switch} label={statusRef.current?.checked ? "Found" : "Unknown"} ref={statusRef} checked={status} onChange={handleStatusInput} />
            </Form.Group>
            {
                statusRef.current?.checked ? 
                <Form.Group className={classes.formGroup} controlId="formBasicTitle">
                    <Form.Label className={classes.text}>Title:</Form.Label>
                    <Form.Control className={classes.formTextInput} name="title" type="text" placeholder="Enter title" value={title} onChange={handleTitleInput} ref={titleRef}/>
                </Form.Group> : null
            }
            <Form.Group className={classes.formGroup} controlId="formBasicDesc">
                <Form.Label className={classes.text}>Description:</Form.Label>
                <Form.Control className={`${classes.formTextArea} ${classes.formInput}`} name="desc" maxLength={descMaxLength} as="textarea" type="text" placeholder="Enter description" value={desc} onChange={handleInput} ref={descRef} />
                <Form.Text className={classes.text}>{desc.length}/{descMaxLength}</Form.Text>
            </Form.Group>
            <div className={classes.formButtons}>
                <div className={classes.formButtons}>
                    <Button className={classes.formButton} variant="primary" type="submit">
                        Update post
                    </Button>
                    <Button className={classes.formButton} size='sm' variant="warning" onClick={()=>navigate(-1)}>
                        Cancel
                    </Button>
                </div>
                <Button className={classes.formButton} size='sm' variant="danger" type="button" onClick={handleDelete}>
                    Delete
                </Button>
            </div>
        </Form>
      </>
    );
  }
  
  export default EditPostForm;
  