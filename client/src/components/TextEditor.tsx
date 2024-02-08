import React, { useCallback, useEffect } from "react";
import { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ImageResize } from "quill-image-resize-module-ts";
import BlotFormatter from "quill-blot-formatter";

import { io } from "socket.io-client";


Quill.register("modules/imageResize", ImageResize);
Quill.register("modules/blotFormatter", BlotFormatter);


const TextEditor: React.FC = () => {

  var quill: any;
  var socket: any;
  
  var toolbarOptions = [
    // toolbar contains different tool to customize the text, image and video in the editor box
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block"],
    [{ header: 1 }, { header: 2 }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    ["link", "image", "video"],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ["clean"],
  ];

  const modules = {
    toolbar: toolbarOptions,
    clipboard: { matchVisual: false }, // toggle to add extra line breaks when pasting HTML:
    imageResize: {
      parchment: Quill.import("parchment"),
      modules: ["Resize", "DisplaySize"],
    },
    blotFormatter: {},
  };

  const containerRef = useCallback((container: any) => {
    if (container == null) return;

    container.innerHTML = "";
    const editor = document.createElement("div");
    container.append(editor);
    quill = new Quill(editor, {
      theme: "snow",
      modules: modules,
    });
    
  }, [])
   

  useEffect(() => {
    socket = io("http://localhost:3001");

    return () => {
      socket.disconnect();
    };
  }, []);
  

// effect-1
  useEffect(() => {
    const handler = (delta: any, oldDelta: any, source: any) => {
      if (source == "api") {
        return;
      } else if (source == "user") {
        socket.emit("send_message", delta);
      }
    };
    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);


// effect-2
  useEffect(() => {
    const handler = (delta: any) => {
      quill.updateContents(delta);
    }
    socket.on("receive_msg", handler);
    
    return () => {
      socket.off("receive_msg", handler);
    };
  },[socket, quill]);


  return (
    <> 
      <div id="container" ref={containerRef}>
      </div>
    </>
  );
};

export default TextEditor;
