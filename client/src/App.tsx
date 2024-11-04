import { Route, BrowserRouter as Router, Routes } from "react-router-dom"

// BrowserRouter as Router: A router that uses the HTML5 history API to keep UI in sync with the URL.
// Routes and Route: These components are used to define the various routes (URL paths) in the application and the corresponding components to render.
import GitHubCorner from "./components/GitHubCorner"
import Toast from "./components/toast/Toast"
import EditorPage from "./pages/EditorPage"
import HomePage from "./pages/HomePage"

const App = () => {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/editor/:roomId" element={<EditorPage />} />
                </Routes>
            </Router>
            <Toast /> {/* Toast component from react-hot-toast */}
            <GitHubCorner />
        </>
    )
}

export default App
