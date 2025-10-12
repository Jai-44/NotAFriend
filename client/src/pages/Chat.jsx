import { useEffect, useState, useRef } from "react";

export default function Chat() {

	const [messages, setMessages] = useState([]);
	const [terminated, setTerminated] = useState(false);
	const [currMessage, setCurrMessage] = useState("");
	const [isConnected, setIsConnected] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [matched, setMatched] = useState(false);
	const [receiver, setReceiver] = useState(localStorage.getItem("receiver"));
	const socketRef = useRef(null);

	const handleChange = (e) => setCurrMessage(e.target.value);

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && currMessage.trim() !== "" && matched) {
			const payload = {
				id: localStorage.getItem("userId"),
				message: currMessage
			};
			socketRef.current.send(JSON.stringify(payload));
			setCurrMessage("");
		}
	};

	const handleClick = () => {
		if (isConnected) return; 

		const userId = localStorage.getItem("userId");
		if (!userId) {
			alert("Please login first");
			return;
		}

		setIsSearching(true);
		socketRef.current = new WebSocket(`ws://localhost:3000/?userId=${userId}`);

		socketRef.current.onopen = () => {
			console.log("Connected to WebSocket");
			setIsConnected(true);
		};

		socketRef.current.onmessage = (e) => {
			try {
				const data = JSON.parse(e.data);
				
				if (data.type === "matched") {
					setIsSearching(false);
					setMatched(true);
					setReceiver(data.with);
					localStorage.setItem("receiver", data.with);
					console.log("Matched with:", data.with);
				} else if (data.type === "disconnected") {
					setMatched(false);
					setReceiver(null);
					localStorage.removeItem("receiver");
					setIsSearching(true);
					console.log("Partner disconnected, searching for new match...");
				} else if (data.type === "no_match") {
					setIsSearching(false);
					setMatched(false);
					setReceiver(null);
					localStorage.removeItem("receiver");
					console.log("No match found");
				} else {
					setMessages((prev) => [...prev, data]);
				}
			} catch (err) {
				console.error("Error parsing message:", err);
				setMessages((prev) => [...prev, e.data]);
			}
		};

		socketRef.current.onclose = () => {
			setTerminated(true);
			setIsConnected(false);
			setIsSearching(false);
		};

		socketRef.current.onerror = (err) => {
			console.error("WebSocket Error:", err);
			setIsSearching(false);
		};
	};

	useEffect(() => {
		return () => {
			if (socketRef.current) {
				socketRef.current.close();
			}
		};
	}, []);

	if (terminated) return <h1>Chat Terminated</h1>;

	return (
		<div>
			{!isConnected ? (
				<button onClick={handleClick}>I want a friend</button>
			) : isSearching ? (
				<div>
					<p>Searching for a friend...</p>
					<button onClick={() => {
						socketRef.current?.close();
						setIsConnected(false);
						setIsSearching(false);
					}}>Cancel</button>
				</div>
			) : matched && receiver ? (
				<div>
					<h2>Chat with {receiver}</h2>
					<input
						type="text"
						value={currMessage}
						onChange={handleChange}
						onKeyDown={handleKeyPress}
						placeholder="Type a message..."
					/>
					<ul>
						{messages.map((msg, i) => (
							<li key={i}>
								{typeof msg === 'string' ? msg : `${msg.id}: ${msg.message}`}
							</li>
						))}
					</ul>
				</div>
			) : isConnected && !isSearching ? (
				<div>
					<p>No match found. Try again later.</p>
					<button onClick={() => {
						socketRef.current?.close();
						setIsConnected(false);
						setIsSearching(false);
						setMatched(false);
						setReceiver(null);
						localStorage.removeItem("receiver");
					}}>Try Again</button>
				</div>
			) : null}
		</div>
	);
}

