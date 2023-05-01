import { useEffect, useState } from 'react';
import classes from './Home.module.css';
import LoadingLayout from '../components/LoadingLayout';
import { Post } from '../Interfaces/Post';
import PostCard from '../components/PostCard';

function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const [posts, setPosts] = useState([] as Post[]);

  useEffect(()=>{
    setLoading(true);
    setTimeout(()=>{
      setLoading(false);
    }, 1000);
    fetch('http://localhost:5000/graphql', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `query Posts {
            posts {
              id
              status
              title
              description
              likes {
                id
              }
              owner {
                id
                username
              }
              createdAt
              filename
            }
          }`,
      })
    }).then(async response => {
      const resJson = (await response.json()).data.posts as unknown as Post[];
      if(resJson){
        console.log(resJson);
        setPosts(resJson);
      }
    }).catch((error) => {
      console.error('Error:', error);
    }).finally(() => {
      setLoading(false);
    });
  },[])

  function handleTabClick(index: number){
    setActiveIndex(index);
  }

  function handleOrderClick(show : boolean){
    setShow(show);
  }

  return (
    <>
      {
          loading ? <LoadingLayout/> : null
      }
      <div className={classes.box}>
        <div className={classes.filter}>
          <button className={`${classes.tabButton} ${ activeIndex == 0 ? classes.active : ''}`} onClick={()=>handleTabClick(0)}>All</button>
          <button className={`${classes.tabButton} ${ activeIndex == 1 ? classes.active : ''}`} onClick={()=>handleTabClick(1)}>Unresolved</button>
          <button className={`${classes.tabButton} ${ activeIndex == 2 ? classes.active : ''}`} onClick={()=>handleTabClick(2)}>Resolved</button>
        </div>
        <div className={classes.order}>
          <button className={`${classes.tabButton} ${ !show ? classes.active : ''}`} onClick={()=>handleOrderClick(false)}>Newest</button>
          <button className={`${classes.tabButton} ${ show ? classes.active : ''}`} onClick={()=>handleOrderClick(true)}>Most liked</button>
        </div>
      </div>
      <>
        {
          posts?.map((post, index) => {
              return (
                <PostCard post={post} key={index}/>
              )
            })
        }
      </>
    </>
  );
}
  
  export default Home;
  