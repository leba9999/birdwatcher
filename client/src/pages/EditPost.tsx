
import { useEffect, useState } from 'react';
import EditPostForm from '../components/EditPostForm';
import classes from './Post.module.css';
import { useParams } from 'react-router-dom';
import { Post } from '../Interfaces/Post';
import LoadingLayout from '../components/LoadingLayout';


function EditPost() {

  const [loading, setLoading] = useState(false);
  const { id } = useParams()

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
      <>
        {
            loading ? <LoadingLayout/> : null
        }
        <div className={classes.box}>
        {
          post ?
          <EditPostForm post={post} reload={()=>setReload(!reload)}/> : null
        }
        </div>
      </>
    );
}
  
export default EditPost;
