import { useState, useEffect } from "react";

interface Messages {
  content: string; // `content` can be a string or an object
  userColor: string | null;
}

export const MESSAGE_RECEIVED = "message_received";

const ChatSection = (props: {
  messages: Messages[] | undefined;
  socket: WebSocket;
  userColor: string | null;
}) => {
  const [chats, setChats] = useState<Messages[]>([]);
  const [openChat, setOpenChat] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  // Ensure the WebSocket is open before attempting to send a message
  useEffect(() => {
    props.socket.onopen = () => {
      console.log("WebSocket is open now.");
    };
    props.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }, [props.socket]);

  // Log userColor whenever it changes
  useEffect(() => {
    console.log("User color updated:", props.userColor);
  }, [props.userColor]);

  useEffect(() => {
    if (props.messages) {
      setChats(props.messages);
    }
  }, [props.messages]);

  const clickHandler = () => {
    setOpenChat(!openChat);
  };

  const sendMessageToServer = (message: string) => {
    const newMessage = { content: message, userColor: props.userColor };
    if (props.socket.readyState === WebSocket.OPEN) {
      props.socket.send(
        JSON.stringify({
          type: MESSAGE_RECEIVED,
          payload: newMessage,
        })
      );
      console.log("Message sent to server:", newMessage);
    } else {
      console.error("WebSocket is not open. Message not sent:", message);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      sendMessageToServer(newMessage);
      setNewMessage("");
    }
  };

  return (
    <div className="fixed top-4 left-10 z-50 mt-12">
      <button
        onClick={clickHandler}
        className="px-8 py-4 text-2xl bg-green-500 hover:bg-green-700 text-white font-bold rounded"
      >
        {openChat ? "Close Chat" : "Open Chat"}
      </button>
      {openChat && (
        <div className="text-white mt-4 p-4 bg-gray-800 rounded shadow-lg">
          <div className="h-64 p-2 border border-gray-700 rounded mb-4 overflow-y-auto">
            {chats?.map((message, index) => {
              return (
                <div
                  key={index}
                  className={`p-2 mb-2 rounded border-b border-gray-600 ${
                    message.userColor === props.userColor
                      ? "bg-blue-500 text-right ml-auto"
                      : "bg-green-500 text-left mr-auto"
                  }`}
                  style={{ maxWidth: "70%" }}
                >
                  <span className="block">{message.content}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center">
            <input
              type="text"
              className="flex-1 px-4 py-2 text-black rounded-l"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
            />
            <button
              onClick={sendMessage}
              className="px-4 py-2 bg-green-500 hover:bg-green-700 text-white font-bold rounded-r"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSection;
