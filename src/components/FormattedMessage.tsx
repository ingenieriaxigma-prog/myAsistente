import ReactMarkdown from 'react-markdown';

interface FormattedMessageProps {
  content: string;
  isUser?: boolean;
}

export function FormattedMessage({ content, isUser = false }: FormattedMessageProps) {
  if (isUser) {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-lg font-bold mt-4 mb-2 text-gray-900">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-bold mt-3 mb-2 text-gray-900">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-bold mt-3 mb-2 text-gray-900">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-bold mt-2 mb-1 text-gray-900">{children}</h4>
          ),
          
          // Paragraphs
          p: ({ children }) => (
            <p className="mb-3 last:mb-0 text-gray-800 leading-relaxed">{children}</p>
          ),
          
          // Lists
          ul: ({ children }) => (
            <ul className="space-y-1 mb-3 ml-4">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1 mb-3 ml-4 list-decimal">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-800 leading-relaxed">{children}</li>
          ),
          
          // Strong/Bold
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900">{children}</strong>
          ),
          
          // Emphasis/Italic
          em: ({ children }) => (
            <em className="italic text-gray-800">{children}</em>
          ),
          
          // Code
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-gray-200 px-1.5 py-0.5 rounded text-sm font-mono text-gray-900">
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-gray-200 p-3 rounded-lg text-sm font-mono text-gray-900 overflow-x-auto mb-3">
                {children}
              </code>
            );
          },
          
          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-3">
              {children}
            </blockquote>
          ),
          
          // Horizontal rule
          hr: () => (
            <hr className="border-gray-300 my-4" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
