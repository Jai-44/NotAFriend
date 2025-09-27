import { useState } from "react";
import { auth } from "./../services/api.js";

function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [banner, setBanner] = useState(null); // general messages

	// Client-side validation aligned with backend constraints
	const validate = (u, p) => {
		const errs = {};
		if (!u) errs.username = "Username required";
		if (!p) errs.password = "Password required";
		else if (p.length < 6) errs.password = "Password must be at least 6 characters";
		return errs;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const u = username.trim();
		const p = password;

		const v = validate(u, p);
		setErrors(v);
		setBanner(null);
		if (Object.keys(v).length > 0) return;

		try {
			setLoading(true);
			const res = await auth(u, p);

			// Success: { success: true, user: { id, username, name }, token }
			if (res.status === 200 && res.data?.success) {
				const token = res.data.token;
				const user = res.data.user;

				if (token) localStorage.setItem("chatAppToken", token);
				if (user?.id != null) localStorage.setItem("userId", String(user.id));

				setErrors({});
				setBanner({ type: "success", text: "Login successful" });
				// TODO: navigate("/chat") or similar
				return;
			}

			// Non-200 or unexpected shape
			const msg = res.data?.message || "Login failed";
			// Backend returns only a generic message for invalid credentials
			setErrors({ username: "", password: msg });
			setBanner({ type: "error", text: msg });
		} catch (err) {
			// Axios-like error normalization
			const msg =
				err.response?.data?.message ||
				err.message ||
				"Network or server error";
			setErrors({ username: "", password: msg });
			setBanner({ type: "error", text: msg });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<h1>Login</h1>

			{banner && (
				<div style={{ color: banner.type === "error" ? "red" : "green" }}>
					{banner.text}
				</div>
			)}

			<form onSubmit={handleSubmit}>
				<div>
					<label>Username</label>
					<input
						type="text" // use "email" only if the backend authenticates by email
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						autoComplete="username"
					/>
					{errors.username && (
						<span style={{ color: "red" }}>{errors.username}</span>
					)}
				</div>

				<div>
					<label>Password</label>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						autoComplete="current-password"
					/>
					{errors.password && (
						<span style={{ color: "red" }}>{errors.password}</span>
					)}
				</div>

				<button type="submit" disabled={loading}>
					{loading ? "Logging in..." : "Login"}
				</button>
			</form>
		</div>
	);
}

export default Login;
