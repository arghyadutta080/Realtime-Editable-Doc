import React, { useCallback, useEffect, useRef, useState } from "react";
import { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { ImageResize } from "quill-image-resize-module-ts";
import BlotFormatter from "quill-blot-formatter";

import { io } from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

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
  
  const [quillEnable, setQuillEnable] = useState<boolean>(false);
  const quillEnableRef = useRef<boolean>(false);

  useEffect(() => {
    quillEnableRef.current = quillEnable;
  }, [quillEnable]);

  const navigate = useNavigate();

  const { id } = useParams();

  const containerRef = useCallback((container: any) => {
    if (container == null) return;

    container.innerHTML = "";
    const editor = document.createElement("div");
    container.append(editor);
    quill = new Quill(editor, {
      theme: "snow",
      modules: modules,
    });
  }, []);


  useEffect(() => {
    socket = io("https://realtime-editable-doc-server.vercel.app");
    // socket = io("http://localhost:3001");
    if (!id) {
      navigate(`/document/${uuidv4()}`);
    }
    socket.emit("join_room", { id });
    console.log("join_room", id);

    return () => {
      socket.disconnect();
    };
  }, []);


  useEffect(() => {
    if (!socket || !quill) return;

    socket.once("get_doc", (doc: any) => {
      console.log("get_doc", doc.data);
      quill.setContents(doc.data);
      setQuillEnable(true);
      console.log(quillEnable);
    });
  }, [id, quill, socket]);

  
  useEffect(() => {
    if (!socket || !quill) return;

    const interval = setInterval(() => {
      console.log(quillEnableRef.current); // save the document after every 1 seconds
      if (quillEnableRef.current == false) return;
      console.log("save_doc", id);
      socket.emit("save_doc", { id, data: quill.getContents() });
      console.log(quill.getContents());
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [quill, socket]);


  // effect-1
  useEffect(() => {
    const handler = (delta: any, oldDelta: any, source: any) => {
      if (source == "api") {
        return;
      } else if (source == "user") {
        // setQuillEnable(true);
        oldDelta;
        socket.emit("send_message", { delta, id });
        console.log(quill.getContents());
        console.log(quillEnableRef.current);
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
    };
    socket.on("receive_msg", handler);

    return () => {
      socket.off("receive_msg", handler);
    };
  }, [socket, quill]);

  
  return (
    <>
      <div id="container" ref={containerRef}></div>
    </>
  );
};

export default TextEditor;
