import ReactMarkdown from 'react-markdown';

interface FormattedMessageProps {
  content: string;
  isUser?: boolean;
}

const normalizeAssistantContent = (raw: string) => {
  if (!raw) return raw;
  let text = raw;
  // Remove internal sources tag from visible output.
  text = text.replace(/\[FUENTES_USADAS:[^\]]+\]/g, '').trim();
  // Ensure headings start on a new line so Markdown can parse them.
  text = text.replace(/([^\n])\s*(#{1,6}\s)/g, '$1\n\n$2');
  // Convert bold-only lines (e.g. **Título**) into markdown headings.
  text = text.replace(/^\*\*([^*\n]+)\*\*\s*$/gm, '### $1');
  // Promote inline bold titles into headings when they start a line.
  text = text.replace(/^\*\*([^*\n]+)\*\*\s*/gm, '### $1\n');
  // Promote bold labels with colon into headings.
  text = text.replace(/^\*\*([^*\n]+?)\*\*:\s*$/gm, '### $1');
  text = text.replace(/^\*\*([^*\n]+?)\*\*:\s*/gm, '### $1\n');
  // Ensure bold labels start on a new line so they become separate sections.
  text = text.replace(/([^\n])\s*(\*\*[^*\n]+?\*\*:)/g, '$1\n\n$2');
  // Ensure ordered list items start on a new line.
  text = text.replace(/([^\n])\s*(\d+\.\s)/g, '$1\n$2');
  // Ensure unordered list items start on a new line.
  text = text.replace(/([^\n])\s*([-*]\s)/g, '$1\n$2');
  // Normalize asterisk bullets into markdown list items with spacing.
  text = text.replace(/([^\n])\s*(\*\s)/g, '$1\n\n- ');
  text = text.replace(/^\*\s/mg, '- ');
  // Add line breaks before common field labels inside list items.
  text = text.replace(/([^\n])\s*(Ofrecido por:|Descripción:|Nota:|Importante:|Recuerda que)/g, '$1\n$2');
  // Ensure blank lines between consecutive list items.
  text = text.replace(/\n(-\s[^\n]+)\n(?!\n)/g, '\n$1\n');
  // Trim excessive blank lines.
  text = text.replace(/\n{3,}/g, '\n\n').trim();
  return text;
};

export function FormattedMessage({ content, isUser = false }: FormattedMessageProps) {
  const normalizedContent = isUser ? content : normalizeAssistantContent(content);

  if (isUser) {
    return <p className="whitespace-pre-wrap">{normalizedContent}</p>;
  }

  return (
    <div className="prose prose-sm max-w-none assistant-message-content">
      <ReactMarkdown
        components={{
          // Section wrapper for assistant responses
          section: ({ children }) => (
            <div className="assistant-section">{children}</div>
          ),
          // Headings
          h1: ({ children }) => (
            <div className="assistant-section">
              <h1 className="assistant-heading">{children}</h1>
            </div>
          ),
          h2: ({ children }) => (
            <div className="assistant-section">
              <h2 className="assistant-heading">{children}</h2>
            </div>
          ),
          h3: ({ children }) => (
            <div className="assistant-section">
              <h3 className="assistant-heading">{children}</h3>
            </div>
          ),
          h4: ({ children }) => (
            <div className="assistant-section">
              <h4 className="assistant-heading">{children}</h4>
            </div>
          ),
          
          // Paragraphs
          p: ({ children }) => (
            <div className="assistant-section">
              <p className="assistant-paragraph">{children}</p>
            </div>
          ),
          
          // Lists
          ul: ({ children }) => (
            <div className="assistant-section">
              <ul className="assistant-list">{children}</ul>
            </div>
          ),
          ol: ({ children }) => (
            <div className="assistant-section">
              <ol className="assistant-list assistant-list-ordered">{children}</ol>
            </div>
          ),
          li: ({ children }) => (
            <li className="assistant-list-item">{children}</li>
          ),
          
          // Strong/Bold
          strong: ({ children }) => (
            <strong className="assistant-strong">{children}</strong>
          ),
          
          // Emphasis/Italic
          em: ({ children }) => (
            <em className="assistant-em">{children}</em>
          ),
          
          // Code
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="assistant-code-inline">
                  {children}
                </code>
              );
            }
            return (
              <div className="assistant-section">
                <code className="assistant-code-block">{children}</code>
              </div>
            );
          },
          
          // Blockquote
          blockquote: ({ children }) => (
            <div className="assistant-section">
              <blockquote className="assistant-quote">{children}</blockquote>
            </div>
          ),
          
          // Horizontal rule
          hr: () => (
            <hr className="border-gray-300 my-4" />
          ),
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}
