import { useState } from "react";
import { auth } from "./../services/api.js"

function Login() {

	// User Credentials
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [errors, setErrors] = useState({})

	//Form Validation
	const formValidation = () => {
		const errors = {};
		if (!username) {
			errors.username = "Username Required!"
		}

		if (!password) {
			errors.password = "Password Required!"
		} else if (password.length() < 6) {
			errors.password = "Password Length Should be 6"
		}

		return errors;
	}

	//Submit Handler
	const handleSubmit = async (e) => {

		e.preventDefault();

		const validationErrors = formValidation();
		setErrors(validationErrors);

		if (Object.keys(validationErrors).length === 0) {

			const response = await auth(username, password);

			if (response.status === 200) {
				const token = response.data.token
				const userId = response.data.userId

				localStorage.setItem("chatAppToken", token)
				localStorage.setItem("userId", userId)

			} else {

				console.error("Login failed:", response.data.message)
				setErrors({
					username: response.data.username || "",
					password: response.data.password || response.data.message || "",
				})
			}
		}
	}

	return (
		<div>
			<h1>Login</h1>
			<form onSubmit={handleSubmit}>
				<div>
					<label>User Name </label>
					<input type="email" value={username} onChange={(e) => setUsername(e.target.value)} />
					{errors.username && ((
						<span style={{ color: "red" }}>{errors.username}</span>
					))}
				</div>
				<div>
					<label>Password</label>
					<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
					{errors.password && ((
						<span style={{ color: "red" }}>{errors.password}</span>
					))}

				</div>
				<button type="submit">Login</button>
			</form>
		</div>
	)
}

export default Login;
