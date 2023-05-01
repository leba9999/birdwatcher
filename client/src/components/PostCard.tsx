import React, { useCallback, useState } from 'react';
import { Post } from '../Interfaces/Post';
import classes from './PostCard.module.css';
import { Oval } from 'react-loader-spinner';

type Props = {
    post : Post;
  };

function PostCard({ post } : Props ) {
    const [loading, setLoading] = useState(true);

    return (
    <div className={classes.box}>
        <p>Posted by: {post.owner.username} {new Date(post.createdAt).toLocaleDateString()}</p>
        <h3>{post.title}</h3>
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
    </div>
    );
  }
  
  export default PostCard;
  