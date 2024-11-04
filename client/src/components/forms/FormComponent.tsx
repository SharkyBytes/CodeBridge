import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"

// It allows components to easily send and receive messages with the server, facilitating real-time interactions, like joining rooms and broadcasting events.
import { SocketEvent } from "@/types/socket"
// For example, it could have values like JOIN_REQUEST or MESSAGE_RECEIVED, which represent different actions or messages that can be sent or received over the WebSocket.
import { USER_STATUS } from "@/types/user"
// The component can use these constants to track and update the user’s status in the application, such as while joining a room or Like ONLINE AND OFLFLINE

import { ChangeEvent, FormEvent, useEffect, useRef } from "react"
// useEffect: This hook is used for managing side effects in functional components, such as setting up event listeners or making API calls when a component mounts or updates.
// useRef: A React hook for accessing and interacting with DOM elements directly, without causing a re-render. Here, it’s likely used to manage focus on input fields, like setting focus on the username input when generating a new room ID.
import { toast } from "react-hot-toast"
import { useLocation, useNavigate } from "react-router-dom"

// useNavigate allows components to programmatically redirect users to different routes, while useLocation provides access to the current location object, helpful for tracking route changes or accessing parameters.
import { v4 as uuidv4 } from "uuid"
// uuidv4() generates a unique room ID, typically used for creating identifiers that are unlikely to collide.
import logo from "@/assets/Untitled design.png"

const FormComponent = () => {
    const location = useLocation()
    const { currentUser, setCurrentUser, status, setStatus } = useAppContext()
    // useAppContext() provides access to the application's shared state (like currentUser, status) and functions (setCurrentUser, setStatus) that are shared across components.
    const { socket } = useSocket()

    const usernameRef = useRef<HTMLInputElement | null>(null)
    const navigate = useNavigate()

    const createNewRoomId = () => { 
        setCurrentUser({ ...currentUser, roomId: uuidv4() })
        toast.success("Created a new Room Id")
        usernameRef.current?.focus()
    }

    const handleInputChanges = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name
        const value = e.target.value
        setCurrentUser({ ...currentUser, [name]: value })
    }

    const validateForm = () => {
        if (currentUser.username.length === 0) {
            toast.error("Enter your username")
            return false
        } else if (currentUser.roomId.length === 0) {
            toast.error("Enter a room id")
            return false
        } else if (currentUser.roomId.length < 5) {
            toast.error("ROOM Id must be at least 5 characters long")
            return false
        } else if (currentUser.username.length < 3) {
            toast.error("Username must be at least 3 characters long")
            return false
        }
        return true
    }

    const joinRoom = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (status === USER_STATUS.ATTEMPTING_JOIN) return
        if (!validateForm()) return
        toast.loading("Joining room...")
        setStatus(USER_STATUS.ATTEMPTING_JOIN)
        socket.emit(SocketEvent.JOIN_REQUEST, currentUser)
    }

    useEffect(() => {
        if (currentUser.roomId.length > 0) return
        if (location.state?.roomId) {
            setCurrentUser({ ...currentUser, roomId: location.state.roomId })
            if (currentUser.username.length === 0) {
                toast.success("Enter your username")
            }
        }
    }, [currentUser, location.state?.roomId, setCurrentUser])

    useEffect(() => {
        if (status === USER_STATUS.DISCONNECTED && !socket.connected) {
            socket.connect()
            return
        }
        const isRedirect = sessionStorage.getItem("redirect") || false

        if (status === USER_STATUS.JOINED && !isRedirect) {
            const username = currentUser.username
            sessionStorage.setItem("redirect", "true")
            navigate(`/editor/${currentUser.roomId}`, {
                state: {
                    username,
                },
            })
        } else if (status === USER_STATUS.JOINED && isRedirect) {
            sessionStorage.removeItem("redirect")
            setStatus(USER_STATUS.DISCONNECTED)
            socket.disconnect()
            socket.connect()
        }
    }, [currentUser, location.state?.redirect, navigate, setStatus, socket, status])

    return (
        <div className="flex w-full max-w-md flex-col items-center justify-center gap-3 p-3 sm:p-10 bg-black rounded-lg shadow-xl">
            {/* Logo */}
            <div className="w-full max-w-[300px] h-[200px] overflow-hidden rounded-lg mb-1 sm:max-w-[400px] sm:h-[200px]">
    <img
        src={logo}
        alt="Logo"
        className="w-full h-full object-cover object-center"
    />
</div>


    
            {/* Form */}
             {/* Form */}
             <form onSubmit={joinRoom} className="flex w-full flex-col gap-5">
                <input
                    type="text"
                    name="roomId"
                    placeholder="Room Id"
                    className="w-full rounded-md border border-[#02dac1] bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-[#02dac1] focus:ring-2 focus:ring-[#02dac1] transition-all duration-200 shadow-sm"
                    onChange={handleInputChanges}
                    value={currentUser.roomId}
                />
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                   className="w-full rounded-md border border-[#02dac1] bg-gray-700 px-4 py-3 text-white placeholder-gray-400 focus:border-[#02dac1] focus:ring-2 focus:ring-[#02dac1] transition-all duration-200 shadow-sm"
                    onChange={handleInputChanges}
                    value={currentUser.username}
                    ref={usernameRef}
                />
                <button
                    type="submit"
                     className="mt-2 w-full rounded-md bg-[#02dac1] px-8 py-3 text-lg font-semibold text-white hover:bg-[#02a59f] transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none"
                >
                    Join
                </button>
            </form>
    
            {/* Generate Room ID Button */}
            <button
                 className="mt-4 text-[#02dac1] hover:text-[#02a59f] cursor-pointer select-none underline transition-all duration-150"
                 onClick={createNewRoomId}
            >
                Generate Unique Room Id
            </button>
        </div>
    );
}    

export default FormComponent
