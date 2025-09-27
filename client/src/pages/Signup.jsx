
import { useState } from "react";
import { auth } from "./../services/api.js"

function Signup() {

	// User Credentials
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [errors, setErrors] = useState({})
	const [banner, setBanner] = useState(null)

	//Form Validation
	const formValidation = () => {
		const errors = {};
		if (!username) {
			errors.username = "Username Required!"
		}

		if (!password) {
			errors.password = "Password Required!"
		} else if (password.length < 6) {
			errors.password = "Password length should be at least 6"
		}

		return errors;
	}

	//Submit Handler
	const handleSubmit = async (e) => {

		e.preventDefault();

		const validationErrors = formValidation();
		setErrors(validationErrors);
		setBanner(null);

		if (Object.keys(validationErrors).length === 0) {

			const response = await auth(username, password, name);

			// Backend signup returns 201 with { success, user } and no token
			if (response.status === 201 && response.data?.success) {
				setErrors({});
				setBanner({ type: "success", text: "Signup successful. Please log in." });

			} else {
				const msg = response.data?.message || "Signup failed"
				console.error("Signup failed:", msg)
				setErrors({
					username: response.data.username || "",
					password: response.data.password || msg || "",
				})
				setBanner({ type: "error", text: msg })
			}
		}
	}

	return (
		<div>
			<h1>Signup</h1>
			{banner && (
				<div style={{ color: banner.type === "error" ? "red" : "green" }}>
					{banner.text}
				</div>
			)}
			<form onSubmit={handleSubmit}>
				<div>
					<label> Name </label>
					<input type="text" value={name} onChange={(e) => setName(e.target.value)} />
				</div>
				<div>
					<label>User Name </label>
					<input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
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
				<button type="submit">Signup</button>
			</form>
		</div>
	)
}

export default Signup;

