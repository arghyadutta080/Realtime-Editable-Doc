import React, { useEffect, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

const App: React.FC = () => {
  const [text, setText] = React.useState<string>("");
  
  // SOCKET.IO EVENT EXECUTING CYCLE IN THIS PROJECT-WORKFLOW:
  // STEP 1. any change detects `text` (change by currentuser or any other user connected in socket) effect-1 useEffect should be executed and emit "send_message" event.
  // STEP 2. at server this "send_message" event is listened and it emits "receive_msg" event.
  // STEP 3. "receive_msg" event is listened at client side in effect-2 useEffect. Then it changes the `text` by setText() and STEP 1 starts executing again.
  
  // PROBLEM AT THE ABOVE WORKFLOW:
  // Due to absence of `clientText` check, the effect-1 useEffect was executing uncontrollably without checking the detected change in `text` made by current user or any other connected user
  
  const [clientText, setClientText] = useState<boolean>(true);
  // true: the changes made in `text` is made by currentuser -> handleTyping()
  // false: the changes in `text` came from another user through web-socket


  // effect-2
  useEffect(() => {
    socket.on("receive_msg", (data: any) => {
      // console.log(data);
      setClientText(false);   // Identifying the changes making in `text` as changes made by another user connected in socket
      setText(data.message);  // and updating the `text`
    });
  }, [socket]);


  // effect-1
  useEffect(() => {
    if (clientText === false) return;               // If changes detected in `text` is made by another user connected in socket, this effect will not be executed.
    socket.emit("send_message", { message: text });
    // console.log(text);
  }, [text]);


  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setClientText(true);      // Identifying the changes making in `text` as changes made by currentuser and letting the effect-1 to emit "send_message" event
    setText(e.target.value);  // and updating the `text`
  };

  
  return (
    <>
      <div>
        <h1>Socket.io</h1>
        <textarea
          value={text}
          onChange={handleTyping}
          style={{ width: "85%", height: "80vh", fontSize: "20px" }}
        ></textarea>
      </div>
    </>
  );
};

export default App;
