"use client"

import { memo, useEffect, useRef, useMemo } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

const QuillRenderPage = memo(
   ({ onQuillReady, 
      defaultValue 
   }: { 
    onQuillReady?: (quill: Quill) => void } & {
    defaultValue?: any
   }) => {
  const quill = useRef<Quill | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const toolbarOptions = useMemo(
    () => [
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
    ],
    []
  );

  useEffect(() => {
    if (editorRef.current && !quill.current) {
      quill.current = new Quill(editorRef.current, {
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
      if (onQuillReady) {
        onQuillReady(quill.current);
      }
    }
  }, [onQuillReady, toolbarOptions]);

   
  useEffect(() => {
      if (quill.current && defaultValue) {
        try {
          const delta =
            typeof defaultValue === "string"
              ? JSON.parse(defaultValue)
              : defaultValue;
          quill.current.setContents(delta);
        } catch {
          // fallback: do nothing
        }
      }
    }, [defaultValue]);
    
  return (
    <div className="flex flex-col w-full h-full">
      <div
        ref={editorRef}
        style={{
          minHeight: "100%",
          background: "#fff",
          borderRadius: "0.5rem",
          border: "1px solid #e5e7eb",
        }}
        className="w-full"
      />
    </div>
  );
});

QuillRenderPage.displayName = "QuillRenderPage";
export default QuillRenderPage;