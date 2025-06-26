"use client"

import { forwardRef, memo, useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const QuillRenderPage = forwardRef<HTMLDivElement>((props, ref) => {
  const quill = useRef<Quill | null>(null);
 
  const toolbarOptions = [
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block"],
    [{ header: 1 }, { header: 2 }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ size: ["small", false, "large", "huge"] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ["clean"],
  ];

  useEffect(() => {
    if (ref && typeof ref !== "function" && ref.current && !quill.current) {
      quill.current = new Quill(ref.current, {
        modules: {
          toolbar: toolbarOptions,
          history: {
            delay: 2000,
            maxStack: 200,
          },
        },
        placeholder: "请输入...",
        theme: "snow",
      });
    }
  }, [ref]);

  return (
    <div className="flex flex-col w-full h-full">
      <div
         ref={ref}
         style={{
           minHeight: "100%", 
           background: "#fff",
           borderRadius: "0.5rem",
           border: "1px solid #e5e7eb",
         }}
         className="w-full"
       />
    </div>
  )  ;
});

QuillRenderPage.displayName = "QuillRenderPage";

export default QuillRenderPage;