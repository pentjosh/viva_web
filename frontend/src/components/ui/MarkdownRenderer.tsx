import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownRendererProps {
  children: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ children }) => {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ className, children: codeChildren, ...props }) {
          const match = /language-(\w+)/.exec(className || "");

          if (match) {
            return (
              <SyntaxHighlighter
                // @ts-expect-error Theme style not matching React.CSSProperties, but this is correct usage
                style={dracula}
                PreTag="div"
                language={match[1]}
                {...props}
              >
                {String(codeChildren).replace(/\n$/, "")}
              </SyntaxHighlighter>
            );
          }
          return (
            <code className={className} {...props}>
              {codeChildren}
            </code>
          );
        },

        p({ children, ...props }) {
          return (
            <p
              style={{ marginBottom: "0.5rem", whiteSpace: "pre-line" }}
              {...props}
            >
              {children}
            </p>
          );
        },
      }}
    >
      {children}
    </Markdown>
  );
};

export default MarkdownRenderer;
