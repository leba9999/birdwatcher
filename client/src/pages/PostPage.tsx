import { useEffect, useState } from 'react';
import PostView from '../components/PostView';
import classes from './Post.module.css';
import { Post } from '../Interfaces/Post';
import { useParams } from 'react-router-dom';

function PostPage() {
  
  const [loading, setLoading] = useState(false);
  const { id } = useParams()

  const [reload, setReload] = useState(false);

  const [post, setPost] = useState<Post | null>(null);

  useEffect(()=>{
    setLoading(true);
    fetch('http://localhost:5000/graphql', {
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
              }
            }
            owner {
              id
              username
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
      }
    }).catch((error) => {
      console.error('Error:', error);
    }).finally(() => {
      setLoading(false);
    });
  },[reload])

    return (
      <div className={classes.box}>
        {
          post ?
          <PostView post={post} reload={()=>setReload(!reload)}/> : null
        }
      </div>
    );
  }
  
  export default PostPage;
  