
interface TokenUser {
    token: string,
    user: {
        id: number,
        username: string,
        email: string,
    }
}

interface OutputUser {
    id: number,
    username: string,
    email: string,
}

export type {TokenUser, OutputUser}