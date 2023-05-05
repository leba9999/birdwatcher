import { useEffect, useState } from "react";
import App from "./App";
import { UserContext } from "./util/UserContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NewPost from "./pages/NewPost";
import PostPage from "./pages/PostPage";
import Profile from "./pages/Profile";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoadingLayout from "./components/LoadingLayout";
import { TokenUser } from "./Interfaces/User";
import Register from "./pages/Register";
import EditPost from "./pages/EditPost";
import UserPage from "./pages/UserPage";
import EditProfile from "./pages/EditProfile";

function Router() {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<TokenUser | null>(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string) : null);
    const [authorized, setAuthorized] = useState(false);

    
    function isAuthorizationValid() {
        fetch(`https://sssf-birdwatcher.azurewebsites.net/api/v1/users/token`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user?.token}`,
            },
        }).then(res => {
            if(res.status === 200) {
                setAuthorized(true);
            } else {
                setAuthorized(false);
            }
        }).catch(err => {
            console.log(err);
            setAuthorized(false);
        }).finally(() => {
            setLoading(false);
        });
   };

    useEffect(() => {
        setLoading(true);
        isAuthorizationValid();
    },[user]);

    return (
        <UserContext.Provider value={ {user, setUser} }>
        <BrowserRouter>
        {
            loading ? <LoadingLayout/> :
                authorized ?
                    <Routes>
                        <Route path="/" element={<App/>}>
                            <Route index element={<Home/>}/>
                            <Route path={"/:id"} element={<PostPage/>}/>
                            <Route path={"/profile"} element={<Profile/>}/>
                            <Route path={"/profile/edit"} element={<EditProfile/>}/>
                            <Route path={"/user/:id"} element={<UserPage/>}/>
                            <Route path={"/edit/:id"} element={<EditPost/>}/>
                            <Route path={"/new"} element={<NewPost/>}/>
                        </Route>
                    </Routes> :
                    <Routes>
                        <Route path="*" element={<Login/>}/>
                        <Route path={"/register"} element={<Register/>}/>
                    </Routes>
        }
        </BrowserRouter>
    </UserContext.Provider>
    );
  }
  
  export default Router;
  