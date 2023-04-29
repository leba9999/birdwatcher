
import classes from "./LoadingLayout.module.css";
import {Oval} from "react-loader-spinner";

const LoadingLayout = () => {
    return(
        <div className={classes.loadingBox}>
            <div className={classes.loading}>
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
            </div>
            <div className={classes.backdrop}/>
        </div>
    )
}

export default LoadingLayout