import PostForm from '../components/PostForm';
import classes from './Post.module.css';

function Post() {

    return (
      <div className={classes.box}>
        <PostForm/>
      </div>
    );
  }
  
  export default Post;
  