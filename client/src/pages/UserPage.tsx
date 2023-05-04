import { useContext, useEffect, useState } from "react";
import LoadingLayout from "../components/LoadingLayout";
import classes from "./Profile.module.css";
import { UserContext } from "../util/UserContext";
import { User } from "../Interfaces/User";
import { Post } from "../Interfaces/Post";
import PostCard from "../components/PostCard";
import { useNavigate, useParams } from "react-router-dom";

function UserPage() {
  const userFromContext = useContext(UserContext);
  const navigate = useNavigate(); 
  const { id } = useParams()
  const [userData, setUserData] = useState<User | null>(null);
  const [postData, setPostData] = useState<Post[]>([]);
  const [originalPosts, setOriginalPosts] = useState([] as Post[]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [url, setUrl] = useState("");

  if(id === userFromContext?.user?.user.id){
    navigate('/profile');
  }

  useEffect(()=>{
    setLoading(true);
    fetch('https://sssf-birdwatcher.azurewebsites.net/graphql', {
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
          userByIdId: id
        },
      })
    }).then(async response => {
      const resJson = (await response.json()).data.userById as unknown as User;
      if(resJson){
        console.log(resJson);
        setUserData(resJson);
        setUrl(`https://sssf-birdwatcher.azurewebsites.net/uploads/${resJson.filename}`);
      }
    }).catch((error) => {
      console.error('Error:', error);
    }).finally(() => {
      setLoading(false);
    });
    fetch('https://sssf-birdwatcher.azurewebsites.net/graphql', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `query PostByOwner($userId: ID!) {
          postByOwner(userId: $userId) {
            id
            status
            title
            filename
            likes {
              id
            }
            owner {
              id
              username
              filename
            }
            comments {
              id
            }
            createdAt
          }
        }`,
        variables: {
          userId: id,
        },
      })
    }).then(async response => {
      const resJson = (await response.json()).data.postByOwner as unknown as Post[];
      if(resJson){
        console.log(resJson);
        setPostData(resJson);
        setOriginalPosts(resJson);
      }
    }).catch((error) => {
      console.error('Error:', error);
    }).finally(() => {
      setLoading(false);
    });

  },[])

  function handleTabClick(index: number){
    setActiveIndex(index);
    if(index === 0){
      setPostData(originalPosts);
    } else {
      let newPosts = [] as Post[];
      for (let i = 0; i < originalPosts?.length; i++) {
        if(!originalPosts[i].status && index === 1){
          newPosts.push(originalPosts[i]);
        } else if (originalPosts[i].status && index === 2) {
          newPosts.push(originalPosts[i]);
        }
      }
      setPostData(newPosts);
    }
  }
  return (
    <>
      {
          loading ? <LoadingLayout/> : null
      }
      <div className={classes.box}>
        <h3 className={classes.title}>{userData?.username}</h3>
        <div className={classes.info}>
          <div className={classes.details}>
            <img className={classes.imagePreview} src={url} alt={userData?.username}/>
            <ul className={classes.list}>
              <li>Username: {userData?.username}</li>
              <li>Joined: {new Date(userData?.createdAt as Date).toLocaleDateString()}</li>
              <li>Posts: {originalPosts?.length}</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className={classes.box}>
          <button className={`${classes.tabButton} ${ activeIndex === 0 ? classes.active : ''}`} onClick={()=>handleTabClick(0)}>All</button>
          <button className={`${classes.tabButton} ${ activeIndex === 1 ? classes.active : ''}`} onClick={()=>handleTabClick(1)}>Unresolved</button>
          <button className={`${classes.tabButton} ${ activeIndex === 2 ? classes.active : ''}`} onClick={()=>handleTabClick(2)}>Resolved</button>
      </div>
      {
          postData?.map((post, index) => {
              return (
                <PostCard post={post} key={index}/>
              )
            })
        }
    </>
  );
  }
  
  export default UserPage;
  