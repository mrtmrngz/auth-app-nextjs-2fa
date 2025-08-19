'use client'
import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {apiRequest} from "@/libs/apiRequest";


type UserTypes = {
    _id: string | number;
    username: string;
    email: string;
    role: "USER" | "ADMIN";
    avatar?: {
        url: string;
        public_id: string
    };
    isVerified: boolean;
    isTwoFactorEnabled: boolean
}

type AuthContextTypes = {
    user: UserTypes | null;
    token: string | null
    authLoading: boolean;
    isAuthCheckComplete: boolean;
    setUser: (u: UserTypes | null) => void
    setToken: (t: string | null) => void
}

const AuthContext = createContext<AuthContextTypes>({
    user: null,
    token: null,
    authLoading: false,
    isAuthCheckComplete: false,
    setUser: () => {
    },
    setToken: () => {
    },
});

export function AuthProvider({children}: {children: ReactNode}){

    const [user, setUser] = useState<null | UserTypes>(null)
    const [token, setToken] = useState<string |null>(null)
    const [authLoading, setAuthLoading] = useState<boolean>(false)
    const [isAuthCheckComplete, setIsAuthCheckComplete] = useState<boolean>(false)

    useEffect(() => {
        const fetchUser = async () => {
            setAuthLoading(true)
            try {
                const response = await apiRequest.get("/auth/get-token")
                if(response?.status === 204) {
                    setUser(null)
                    setToken(null)
                    delete apiRequest.defaults.headers.common["Authorization"];
                }else {
                    const { accessToken, success: tokenSuccess } = response.data
                    if(tokenSuccess) {
                        apiRequest.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`
                        setToken(accessToken)
                        const { data } = await apiRequest.get("/users/user-info")
                        setUser(data)
                    }
                }
            }catch (err) {
                setToken(null)
                setUser(null)
                delete apiRequest.defaults.headers.common["Authorization"];
            }finally {
                setAuthLoading(false)
                setIsAuthCheckComplete(true)
            }
        }
        fetchUser()
    }, [])

    return (
        <AuthContext.Provider value={{
            user,
            token,
            authLoading,
            isAuthCheckComplete,
            setToken,
            setUser
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)