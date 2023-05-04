import { useContext, useEffect, useRef, useState } from "react";
import { UpdateComment } from "../Interfaces/Comment";
import { UserContext } from "../util/UserContext";
import Form from 'react-bootstrap/Form';
import { Button } from 'react-bootstrap';
import classes from './PostComments.module.css';
import { Comment } from "../Interfaces/Comment";
import { Link } from "react-router-dom";

type Props = {
    comments : Comment[];
    reload : () => void;
};

function PostComments({ comments, reload } : Props ) {
    const userFromContext = useContext(UserContext);

    const [editComment, setEditComment] = useState<boolean[]>([]);
    const [updatecommentText, setUpdatecommentText] = useState("");
    const [commentID, setCommentID] = useState("");

    const updateformRef = useRef<HTMLFormElement | null>(null);
    const updatecommentRef = useRef<HTMLTextAreaElement | null>(null);
    
    const CommentMaxLength=500;
    
    const [validated, setValidated] = useState(false);
    
    useEffect(() => {
        setEditComment(new Array(comments.length).fill(false));
    }, [comments]);

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

            fetch('https://sssf-birdwatcher.azurewebsites.net/graphql', {
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
        fetch('https://sssf-birdwatcher.azurewebsites.net/graphql', {
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
    const handleUpdateInput = () =>{
        setUpdatecommentText(updatecommentRef.current?.value as string)
        setValidated(false);
    }
    return (
    <div>
        {comments.map((comment, index) => {
            let edit = [] as boolean[];
            edit[index] = false;
            return (
                <div key={comment.id}>
                    <div className={classes.title}>
                        <Link className={classes.link} to={`/user/${comment.owner.id}`}>
                            <div className={classes.postedby}>
                                <img className={classes.profilePic} src={`https://sssf-birdwatcher.azurewebsites.net/uploads/${comment.owner.filename}_thumb.png`}/>
                                {comment.owner.username} {new Date(comment.createdAt).toLocaleDateString()}
                            </div>
                        </Link>
                        {
                            !editComment[index] ?
                                comment.owner.id === userFromContext?.user?.user.id ?
                                <p className={classes.link} onClick={()=>{
                                    edit[index]=true; 
                                    setEditComment(edit);
                                    setUpdatecommentText(comment.text);
                                    setCommentID(comment.id!);
                                    }}>edit</p> : null
                            : 
                            <p className={`${classes.cancellink}`} onClick={reload}>cancel</p>
                        }
                    </div>
                    { 
                    !editComment[index] ?
                        <div className={classes.comment}>
                            {comment.text}
                        </div>
                        :
                        <Form ref={updateformRef} className={classes.Form} noValidate validated={validated} onSubmit={handleUpdateSubmit}>
                            <Form.Group className={classes.formGroup} controlId="formBasicComment">
                                <Form.Label className={classes.text}>Edit comment:</Form.Label>
                                <Form.Control className={`${classes.formTextArea} ${classes.formInput}`} required name="comment" maxLength={CommentMaxLength} as="textarea" type="text" placeholder="Add a comment..." value={updatecommentText} onChange={handleUpdateInput} ref={updatecommentRef} />
                                <Form.Control.Feedback type="invalid">
                                    Text for comment is required.
                                </Form.Control.Feedback>
                                <div className={classes.formDetails}>
                                    <Form.Text className={classes.text}>{updatecommentText.length}/{CommentMaxLength}</Form.Text>
                                    <div>
                                        <Button className={classes.formButton} size="sm" variant="primary" type="submit">
                                            Update
                                        </Button>
                                        <p className={classes.delete} onClick={handleCommentDelete}>
                                            Delete
                                        </p>
                                    </div>
                                </div>
                            </Form.Group>
                        </Form>
                    }
                </div>
            );
        })}
    </div>)
}
export default PostComments;
