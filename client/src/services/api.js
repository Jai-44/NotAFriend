import axios from "axios"

export const auth = async (username, password, name) => {
	try {
		const endpoint = name ? "/api/auth/signup" : "/api/auth/login"
		const body = name
			? { username, password, name }
			: { username, password }

		const response = await axios.post(`http://localhost:3000${endpoint}`, body)
		return response
	} catch (err) {
		if (err.response) return err.response
		else throw err
	}
}

