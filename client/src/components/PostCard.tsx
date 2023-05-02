import React, { useCallback, useState } from 'react';
import { Post } from '../Interfaces/Post';
import classes from './PostCard.module.css';
import { Oval } from 'react-loader-spinner';
import { Link } from 'react-router-dom';

type Props = {
    post : Post;
};

function PostCard({ post } : Props ) {
    const [loading, setLoading] = useState(true);

    return (
    <div className={classes.box}>
        <Link className={classes.link} to={`/user/${post.owner.id}`}>
            <p>Posted by: {post.owner.username} {new Date(post.createdAt).toLocaleDateString()}</p>
        </Link>
        <Link className={classes.link} to={`/${post.id}`}>
        <h3 className={classes.title}>
            <i className="fa-solid fa-magnifying-glass"></i>
            {post.title}
        </h3>
        </Link>
        <div className={classes.imageBox}>
            <img className={classes.imagePreview} onLoadedData={()=>setLoading(false)} onLoad={()=>setLoading(false)} src={`http://localhost:5000/uploads/${post.filename}`} alt={post.filename}/>
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
  