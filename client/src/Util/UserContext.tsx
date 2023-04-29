import {createContext} from 'react'
import { TokenUser } from '../Interfaces/User';

type UserContextType = {
    user: TokenUser | null,
    setUser: React.Dispatch<React.SetStateAction<TokenUser | null>>,
}

export const UserContext = createContext<UserContextType | null>(null);