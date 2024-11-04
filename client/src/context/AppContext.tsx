import {
    ACTIVITY_STATE,
    AppContext as AppContextType,
    DrawingData,
} from "@/types/app"
import { RemoteUser, USER_STATUS, User } from "@/types/user"
import { ReactNode, createContext, useContext, useState } from "react"

const AppContext = createContext<AppContextType | null>(null)

// In React, a context is a way to share values and state across the component tree without having to pass props down manually at every level. It is particularly useful for global data that multiple components need access to, such as user authentication status, theme settings, or application-wide preferences.

export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext)
    if (context === null) {
        throw new Error(
            "useAppContext must be used within a AppContextProvider",
        )
    }
    return context
}

// Application Context
// It's used to get the context associated with the Application, which contains all of the activities running within it

function AppContextProvider({ children }: { children: ReactNode }) {
    const [users, setUsers] = useState<RemoteUser[]>([])
    const [status, setStatus] = useState<USER_STATUS>(USER_STATUS.INITIAL)
    const [currentUser, setCurrentUser] = useState<User>({
        username: "",
        roomId: "",
    })
    const [activityState, setActivityState] = useState<ACTIVITY_STATE>(
        ACTIVITY_STATE.CODING,
    )
    const [drawingData, setDrawingData] = useState<DrawingData>(null)

    return (
        <AppContext.Provider
            value={{
                users,
                setUsers,
                currentUser,
                setCurrentUser,
                status,
                setStatus,
                activityState,
                setActivityState,
                drawingData,
                setDrawingData,
            }}
            // yha values set kri he 
        >
            {children}
        </AppContext.Provider>
    )
}

export { AppContextProvider }
export default AppContext
