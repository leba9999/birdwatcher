import { useEffect, useState } from 'react';
import PostView from '../components/PostView';
import classes from './Post.module.css';
import { Post } from '../Interfaces/Post';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import LoadingLayout from '../components/LoadingLayout';

function PostPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { id } = useParams()
  const [notFound, setNotFound] = useState(false);

  const [reload, setReload] = useState(false);

  const [post, setPost] = useState<Post | null>(null);

  useEffect(()=>{
    setLoading(true);
    fetch('https://sssf-birdwatcher.azurewebsites.net/graphql', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `query PostById($postByIdId: ID!) {
          postById(id: $postByIdId) {
            id
            status
            title
            description
            likes {
              id
            }
            comments {
              text
              id
              createdAt
              owner {
                id
                username
                filename
              }
            }
            owner {
              id
              username
              filename
            }
            createdAt
            filename
          }
        }`,
        variables: {
          postByIdId: id,
        },
      })
    }).then(async response => {
      const resJson = (await response.json()).data.postById as unknown as Post;
      if(resJson){
        console.log(resJson);
        setPost(resJson);
      } else if (!resJson) {
        setNotFound(true);
      } else{
        navigate(-1);
      }
    }).catch((error) => {
      console.error('Error:', error);
    }).finally(() => {
      setLoading(false);
    });
  },[reload])

    return (
      <>
        {
            loading ? <LoadingLayout/> : null
        }
        <div className={classes.box}>
          {
            notFound ? 
            <>  
              <h1>Post not found!</h1>
              <Button onClick={()=>navigate(-1)}>Return</Button>
            </> 
            : 
              post ?
              <PostView post={post} reload={()=>setReload(!reload)}/> : null
          }
        </div>
      </>
    );
  }
  
  export default PostPage;
  