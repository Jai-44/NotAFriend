
import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar.jsx"
import Home from "./pages/Home.jsx"
import Login from "./pages/Login.jsx"
import Chat from "./pages/Chat.jsx"
import Signup from "./pages/Signup.jsx"

function App() {
	return (
		<>
			<Navbar />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/chat" element={<Chat />} />
			</Routes>
		</>
	)
}

export default App

