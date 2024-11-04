import { useAppContext } from "@/context/AppContext"
import { useFileSystem } from "@/context/FileContext"
import { useSettings } from "@/context/SettingContext"
import { useSocket } from "@/context/SocketContext"
// AppContext: Provides access to user data (users, currentUser) for tracking active users and their status.
// FileContext: Manages the file system (activeFile, setActiveFile), focusing on the file currently being edited.
// SettingContext: Supplies editor settings like theme, programming language, and font size to customize the editing experience.
// SocketContext: Manages the WebSocket connection, allowing real-time interactions such as typing and file updates.
import usePageEvents from "@/hooks/usePageEvents"
import useResponsive from "@/hooks/useResponsive"

// usePageEvents: Handles page-wide events like scroll or zoom, preventing actions like page reloads during edits.
// useResponsive: Manages responsive layout adjustments, ensuring the editor scales with the viewport (viewHeight).
import { editorThemes } from "@/resources/Themes"
import { FileSystemItem } from "@/types/file"
import { SocketEvent } from "@/types/socket"
import { color } from "@uiw/codemirror-extensions-color"
import { hyperLink } from "@uiw/codemirror-extensions-hyper-link"
import { LanguageName, loadLanguage } from "@uiw/codemirror-extensions-langs"
// CodeMirror: The core component for the code editor, extended by plugins for additional functionality.
// color: Adds color highlighting support.
// hyperLink: Adds clickable hyperlink functionality within the code.
// tooltipField and cursorTooltipBaseTheme: Custom tooltips, possibly showing collaborator cursor positions or messages.
// loadLanguage: Dynamically loads the appropriate syntax highlighting based on the selected language.
import CodeMirror, {
    Extension,
    ViewUpdate,
    scrollPastEnd,
} from "@uiw/react-codemirror"
import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { cursorTooltipBaseTheme, tooltipField } from "./tooltip"

// These imports are custom extensions created in your project, likely to enhance the editor with collaborative features:
// cursorTooltipBaseTheme: Presumably a base theme for displaying tooltips, customized for showing additional information like user cursors.
// tooltipField: Likely a custom CodeMirror field that shows tooltips for other users’ cursors in the editor, improving real-time collaboration by indicating where other users are working in the document.

function Editor() {
    const { users, currentUser } = useAppContext()
    // etrieves active user data
    // jao dekh kraao appcontext file ko 
    const { activeFile, setActiveFile } = useFileSystem()
    // Gets the current file being edited and a function to update it.
    // good file 

    const { theme, language, fontSize } = useSettings()

    const { socket } = useSocket()
    // Accesses the WebSocket instance for real-time communication.
    const { viewHeight } = useResponsive()
    //  Gets the current height of the editor view for responsive design.
    const [timeOut, setTimeOut] = useState(setTimeout(() => { }, 0))
    // : Manages a timeout for typing events to detect pauses in typing.

    const filteredUsers = useMemo(
        () => users.filter((u) => u.username !== currentUser.username),
        [users, currentUser],
    )
    // Filters the list of users to exclude the current user, likely for displaying collaborator information.
    const [extensions, setExtensions] = useState<Extension[]>([])
    // : Initializes an array to hold CodeMirror extensions.

    const onCodeChange = (code: string, view: ViewUpdate) => {
        if (!activeFile) return

        const file: FileSystemItem = { ...activeFile, content: code }
        setActiveFile(file)


        const cursorPosition = view.state?.selection?.main?.head
        socket.emit(SocketEvent.TYPING_START, { cursorPosition })
        socket.emit(SocketEvent.FILE_UPDATED, {
            fileId: activeFile.id,  
            newContent: code,
        })
        clearTimeout(timeOut)

        const newTimeOut = setTimeout(
            () => socket.emit(SocketEvent.TYPING_PAUSE),
            1000,
        )
        setTimeOut(newTimeOut)
    }
    // onCodeChange: This function handles code changes in the editor:
    // Updates the active file's content.
    // Emits socket events to notify other users about typing activity (starting and pausing).
    // Implements a timeout to detect when the user has paused typing.

    // Listen wheel event to zoom in/out and prevent page reload
    usePageEvents()

    useEffect(() => {
        const extensions = [
            color,
            hyperLink,
            tooltipField(filteredUsers),
            cursorTooltipBaseTheme,
            scrollPastEnd(),
        ]
        const langExt = loadLanguage(language.toLowerCase() as LanguageName)
        if (langExt) {
            extensions.push(langExt)
        } else {
            toast.error(
                "Syntax highlighting is unavailable for this language. Please adjust the editor settings; it may be listed under a different name.",
                {
                    duration: 5000,
                },
            )
        }

        setExtensions(extensions)
    }, [filteredUsers, language])

    //     This useEffect hook is responsible for dynamically managing the functionality of the CodeMirror editor based on user interactions and settings. It ensures that:

    // The editor is equipped with useful extensions for collaboration and syntax highlighting.
    // Users receive feedback if their selected language doesn't support syntax highlighting.
    // The editor is responsive to changes in user context, providing a tailored editing experience.

    return (
        <CodeMirror
            theme={editorThemes[theme]}
            onChange={onCodeChange}
            value={activeFile?.content}
            extensions={extensions}
            minHeight="100%"
            maxWidth="100vw"
            style={{
                fontSize: fontSize + "px",
                height: viewHeight,
                position: "relative",
            }}
        />
    )
}

export default Editor
