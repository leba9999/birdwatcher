import React, { useRef, useState } from 'react';
import { Post } from '../Interfaces/Post';
import classes from './PostCard.module.css';
import { Oval } from 'react-loader-spinner';
import { Link } from 'react-router-dom';

type Props = {
    post : Post;
};

function PostCard({ post } : Props ) {
    const [loading, setLoading] = useState(true);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const url = `https://sssf-birdwatcher.azurewebsites.net/uploads/${post.filename}_medium.png`;

    function handleImageError(event : React.SyntheticEvent<HTMLImageElement, Event>){
        console.log(event);
        if(imageRef){
            imageRef.current!.src = `https://sssf-birdwatcher.azurewebsites.net/uploads/${post.filename}`;
        }
    }

    return (
    <div className={classes.box}>
        <Link className={classes.userlink} to={`/user/${post.owner.id}`}>
            <div className={classes.postedby}>
                <img className={classes.profilePic} src={`https://sssf-birdwatcher.azurewebsites.net/uploads/${post.owner.filename}_thumb.png`}/>
                {post.owner.username} {new Date(post.createdAt).toLocaleDateString()}
            </div>
        </Link>
        <Link className={classes.link} to={`/${post.id}`}>
            <h3 className={classes.title}>
                {
                    post.status ? 
                    <i className={`${classes.titleIcon} ${classes.foundIcon} fa-solid fa-circle-check`}></i>:
                    <i className={`${classes.titleIcon} fa-solid fa-magnifying-glass`}></i>

                }
                {post.title}
            </h3>
            <div className={classes.imageBox}>
                <img className={classes.imagePreview} ref={imageRef} onLoadedData={()=>setLoading(false)} onLoad={()=>setLoading(false)} src={url} onError={handleImageError} alt={post.filename}/>
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
            <p className={classes.details} ><i className={`${classes.titleIcon} fa-solid fa-comments fa-lg`}></i> - {post.comments.length} Comments</p>
        </Link>
    </div>
    );
  }
  
  export default PostCard;
  