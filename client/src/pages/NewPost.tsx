import PostForm from '../components/NewPostForm';
import classes from './Post.module.css';

function NewPost() {

    return (
      <div className={classes.box}>
        <PostForm/>
      </div>
    );
  }
  
  export default NewPost;
  