import { createContext, useContext, useState, useEffect } from 'react'

const userContext = createContext()

const AuthContext = ({ children }) => {

    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem("user")
            return saved ? JSON.parse(saved) : null
        } catch {
            return null
        }
    })

    useEffect(() => {
        if (user) {
            localStorage.setItem("user", JSON.stringify(user))
        } else {
            localStorage.removeItem("user")
        }
    }, [user])

    const Login = (user) => {
        setUser(user)
    }

    // const Logout = () => {
    //     setUser(null)
    //     localStorage.removeItem("user")
    //     // لو عندك token كمان:
    //     // localStorage.removeItem("token")
    //   }
    
    return (
        <userContext.Provider value={{ user, Login }}>
            {children}
        </userContext.Provider>
    )
}

export const UseAuth = () => useContext(userContext)

export default AuthContext