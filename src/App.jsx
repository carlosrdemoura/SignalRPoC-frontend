import React, { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import './App.css';

const App = () => {
    const [messages, setMessages] = useState([]);
    const chatWindowRef = useRef(null);

    const HUB_URL = "https://signalr-poc-8454cb2aaafa.herokuapp.com/RobbCoreNotificationHub";

    useEffect(() => {
        const connection = new HubConnectionBuilder()
            .withUrl(HUB_URL)
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        // Correctly handle 'title' and 'message' as separate parameters
        connection.on("ReceiveMessage", (title, message) => {
            // Create a new message object and add it to the state
            setMessages(prevMessages => [...prevMessages, { title, message }]);
        });

        const startConnection = async () => {
            try {
                await connection.start();
                console.log("SignalR Connected.");
            } catch (err) {
                console.error("SignalR Connection Error: ", err);
            }
        };

        startConnection();

        return () => {
            connection.stop().then(() => console.log("SignalR Disconnected."));
        };
    }, []);

    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="app-container">
            <h1>SignalR Chat PoC</h1>
            <div className="chat-window" ref={chatWindowRef}>
                {messages.length === 0 && (
                    <p className="message system">Waiting for messages from the server...</p>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className="message server">
                        <strong>{msg.title}</strong>
                        <p>{msg.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;