import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Post } from '../Interfaces/Post';
import classes from './PostCard.module.css';
import { Oval } from 'react-loader-spinner';
import { Link } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import { Button } from 'react-bootstrap';
import { UserContext } from '../util/UserContext';
import { Comment, NewComment, UpdateComment } from '../Interfaces/Comment';

type Props = {
    post : Post;
    reload : () => void;
};

function PostView({ post, reload } : Props ) {
    const userFromContext = useContext(UserContext);
    
    const [loading, setLoading] = useState(false);

    const [editComment, setEditComment] = useState<boolean[]>([]);

    const CommentMaxLength=500;
    const [commentText, setCommentText] = useState("");
    const [updatecommentText, setUpdatecommentText] = useState("");
    const [commentID, setCommentID] = useState("");

    const [validated, setValidated] = useState(false);
    
    const formRef = useRef<HTMLFormElement | null>(null);
    const commentRef = useRef<HTMLTextAreaElement | null>(null);

    const updateformRef = useRef<HTMLFormElement | null>(null);
    const updatecommentRef = useRef<HTMLTextAreaElement | null>(null);
    
    useEffect(() => {
        setEditComment(new Array(post.comments.length).fill(false));
    }, [post.comments]);

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
            const comment : NewComment = {
                text: commentText,
                owner: userFromContext?.user?.user.id as string,
                post: post.id,
            };

            fetch('http://localhost:5000/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':  `Bearer ${userFromContext?.user?.token}`,
                },
                body: JSON.stringify({
                    query: `mutation CreateComment($text: String!, $owner: ID!, $post: ID!) {
                        createComment(text: $text, owner: $owner, post: $post) {
                          id
                          text
                          owner {
                            id
                          }
                          post {
                            id
                          }
                          createdAt
                        }
                      }`,
                    variables: {
                      ...comment,
                    },
                })
            }).then(async response => {
                const resJson = await response.json();
                console.log(resJson);
                if(!resJson.errors){
                    //handleShow();
                }else{
                    throw new Error('Something went wrong');
                }
            }).catch((error) => {
                console.error('Error:', error);
            }).finally(() => {
                reload();
            });
        }
    }
    async function handleUpdateSubmit(event: React.FormEvent<HTMLFormElement>){
        const form = updateformRef.current;
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
            const comment : UpdateComment = {
                text: updatecommentText,
            };

            fetch('http://localhost:5000/graphql', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization':  `Bearer ${userFromContext?.user?.token}`,
                },
                body: JSON.stringify({
                    query: `mutation UpdateComment($updateCommentId: ID!, $text: String!) {
                        updateComment(id: $updateCommentId, text: $text) {
                          id
                          text
                          owner {
                            id
                          }
                          post {
                            id
                          }
                          createdAt
                        }
                      }`,
                    variables: {
                      ...comment,
                      updateCommentId: commentID,
                    },
                })
            }).then(async response => {
                const resJson = await response.json();
                console.log(resJson);
                if(!resJson.errors){
                    //handleShow();
                }else{
                    throw new Error('Something went wrong');
                }
            }).catch((error) => {
                console.error('Error:', error);
            }).finally(() => {
                reload();
            });
        }
    }
    async function handleCommentDelete(){
        fetch('http://localhost:5000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization':  `Bearer ${userFromContext?.user?.token}`,
            },
            body: JSON.stringify({
                query: `mutation DeleteComment($deleteCommentId: ID!) {
                    deleteComment(id: $deleteCommentId) {
                      id
                    }
                  }`,
                variables: {
                  deleteCommentId: commentID,
                },
            })
        }).then(async response => {
            const resJson = await response.json();
            console.log(resJson);
            if(!resJson.errors){
                //handleShow();
            }else{
                throw new Error('Something went wrong');
            }
        }).catch((error) => {
            console.error('Error:', error);
        }).finally(() => {
            reload();
        });
    }
    
    const handleInput = () =>{
        setCommentText(commentRef.current?.value as string)
    }
    const handleUpdateInput = () =>{
        setUpdatecommentText(updatecommentRef.current?.value as string)
    }
    return (
    <div className={classes.box}>
        <Link className={classes.link} to={`/user/${post.owner.id}`}>
            <p>Posted by: {post.owner.username} {new Date(post.createdAt).toLocaleDateString()}</p>
        </Link>
        <h3 className={classes.title}>
            <i className="fa-solid fa-magnifying-glass"></i>
            {post.title}
        </h3>
        <div className={classes.imageBox}>
            <img className={classes.imagePreview} onLoadedData={()=>setLoading(false)} onLoad={()=>setLoading(false)} src={`http://localhost:5000/uploads/${post.filename}.jpg`} alt={post.filename}/>
            {
                loading ? <div className={classes.loading}>
                <Oval
                    height={100}
                    width={100}
                    color="#9D16E0FF"
                    wrapperStyle={{}}
                    wrapperClass=""
                    visible={true}
                    ariaLabel='oval-loading'
                    secondaryColor="#2d2d30"
                    strokeWidth={4}
                    strokeWidthSecondary={2}
                />
            </div> : null
            }
        </div>
        <p>{post.likes.length} likes</p>
        Description:
        <p>{post.description}</p>
        <Form ref={formRef} className={classes.Form} noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className={classes.formGroup} controlId="formBasicComment">
                <Form.Label className={classes.text}>Add comment:</Form.Label>
                <Form.Control className={`${classes.formTextArea} ${classes.formInput}`} name="comment" maxLength={CommentMaxLength} required as="textarea" type="text" placeholder="Add a comment..." value={commentText} onChange={handleInput} ref={commentRef} />
                <Form.Text className={classes.text}>{commentText.length}/{CommentMaxLength}</Form.Text>
                <Form.Control.Feedback type="invalid">
                        Text for comment is required.
                    </Form.Control.Feedback>
            </Form.Group>
            <Button className={classes.formButton} variant="primary" type="submit">
                Comment
            </Button>
        </Form>
        <div>
            {post.comments.map((comment, index) => {
                let edit = [] as boolean[];
                edit[index] = false;
                return (
                    <div key={comment.id}>
                        {
                            !editComment[index] ?
                            <>
                                <p>{comment.owner.username} {new Date(comment.createdAt).toLocaleDateString()}</p>
                                <p>{comment.text}</p> 
                                {
                                    comment.owner.id === userFromContext?.user?.user.id ?
                                    <p onClick={()=>{
                                        edit[index]=true; 
                                        setEditComment(edit);
                                        setUpdatecommentText(comment.text);
                                        setCommentID(comment.id!);
                                        }}>edit</p> : null

                                }
                            </>
                            :
                            <Form ref={updateformRef} className={classes.Form} noValidate validated={validated} onSubmit={handleUpdateSubmit}>
                                <Form.Group className={classes.formGroup} controlId="formBasicComment">
                                    <Form.Label className={classes.text}>Add comment:</Form.Label>
                                    <Form.Control className={`${classes.formTextArea} ${classes.formInput}`} required name="comment" maxLength={CommentMaxLength} as="textarea" type="text" placeholder="Add a comment..." value={updatecommentText} onChange={handleUpdateInput} ref={updatecommentRef} />
                                    <Form.Text className={classes.text}>{updatecommentText.length}/{CommentMaxLength}</Form.Text>
                                    <Form.Control.Feedback type="invalid">
                                        Text for comment is required.
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Button className={classes.formButton} variant="primary" type="submit">
                                    Comment
                                </Button>
                                <Button className={classes.formButton} variant="warning" type="button" onClick={reload}>
                                    Cancel
                                </Button>
                                <Button className={classes.formButton} variant="danger" type="button" onClick={handleCommentDelete}>
                                    Delete
                                </Button>
                            </Form>
                        }               
                    </div>
                );
            })}
        </div>

    </div>
    );
  }
  
  export default PostView;
  