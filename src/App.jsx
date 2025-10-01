import React, { useState, useEffect, useRef } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import './App.css';

const App = () => {
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const chatWindowRef = useRef(null);

    const HUB_URL = "https://signalr-poc-8454cb2aaafa.herokuapp.com/RobbCoreNotificationHub";

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl(HUB_URL)
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();
        
        setConnection(newConnection);

        newConnection.on("ReceiveMessage", (title, message) => {
            setMessages(prevMessages => [...prevMessages, { title, message }]);
        });

        newConnection.start()
            .then(() => console.log("SignalR Connected."))
            .catch(err => console.error("SignalR Connection Error: ", err));

        return () => {
            newConnection.stop().then(() => console.log("SignalR Disconnected."));
        };
    }, []);

    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages]);

    const sendPageViewEvent = async () => {

        const currentPath = window.location.pathname;

        if (connection) {
            try {
                await connection.invoke("PageViewed", currentPath);
                console.log(`PageViewed event sent for path: ${currentPath}`);
            } catch (err) {
                console.error("Error invoking PageViewed: ", err);
            }
        } else {
            alert("Connection not established.");
        }
    };

    return (
        <div className="app-container">
            <h1>SignalR Chat PoC</h1>

            <button 
                className="action-button" 
                onClick={sendPageViewEvent} 
                disabled={!connection}>
                Send "Page Viewed" Event
            </button>

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