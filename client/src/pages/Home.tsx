import { ReactComponentElement, useCallback, useEffect, useState } from 'react';
import classes from './Home.module.css';
import LoadingLayout from '../components/LoadingLayout';
import { Post } from '../Interfaces/Post';
import PostCard from '../components/PostCard';
import InfiniteScroll from 'react-infinite-scroller';
import { Oval } from 'react-loader-spinner';

function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any>([]);
  const [hasMore, setHasMore] = useState(true);

  const [originalPosts, setOriginalPosts] = useState([] as Post[]);
  const [posts, setPosts] = useState([] as Post[]);

  useEffect(()=>{
    setLoading(true);
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
              comments {
                id
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
      })
    }).then(async response => {
      const resJson = (await response.json()).data.posts as unknown as Post[];
      if(resJson){
        resJson.sort((a:Post, b :Post) => {
          const aDate = new Date(a.createdAt)
          const bDate = new Date(b.createdAt)
          return bDate.getTime() - aDate.getTime();
        });
        setPosts(resJson);
        setOriginalPosts(resJson);
      }
    }).catch((error) => {
      console.error('Error:', error);
    }).finally(() => {
      handleSort();
      setLoading(false);
    });
  },[])

  function handleTabClick(index: number){
    setActiveIndex(index);
    if(index === 0){
      setPosts(originalPosts);
    } else {
      let newPosts = [] as Post[];
      for (let i = 0; i < originalPosts?.length; i++) {
        if(!originalPosts[i].status && index === 1){
          newPosts.push(originalPosts[i]);
        } else if (originalPosts[i].status && index === 2) {
          newPosts.push(originalPosts[i]);
        }
      }
      setPosts(newPosts);
    }
  }

  function handleSort(){
    if(show){
      posts.sort((a:Post, b :Post) => {
        const aDate = new Date(a.createdAt)
        const bDate = new Date(b.createdAt)
        return bDate.getTime() - aDate.getTime();
      });
    } else{
      posts.sort((a:Post, b :Post) => {
        const aDate = new Date(a.createdAt)
        const bDate = new Date(b.createdAt)
        return aDate.getTime() - bDate.getTime();
      });
    }

  }
  function handleOrderClick(show : boolean){
    handleSort();
    setShow(show);
  }
  const loadFunc = useCallback(
    async (posts : Post[]) => {
      if(posts.length){
        let newItems = [...items];
        for (let i = items.length; i < items.length + 2; i++) {
            if(posts.length > newItems.length){
                newItems[i] = (<PostCard post={posts[i]} key={i}/>);
            }
        }
        setItems(newItems);
        if (posts.length <= items.length) {
            setHasMore(false);
            return;
        } else {
            setHasMore(true);
        }
      }
    }, [items])

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
          <button className={`${classes.tabButton} ${ show ? classes.active : ''}`} onClick={()=>handleOrderClick(true)}>Oldest</button>
        </div>
      </div>
      <>{posts.length <= 0 ? null :
      <InfiniteScroll className={classes.events}
                loadMore={()=>loadFunc(posts)}
                hasMore={hasMore}
                loader={
                    <div key={0} className={classes.loading}>
                        <p>Loading...</p>
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
                    </div>}
            >
                {items}
            </InfiniteScroll> }
      </>
    </>
  );
}
  
  export default Home;
  