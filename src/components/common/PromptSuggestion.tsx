// Componente para mostrar sugerencias de prompts

interface PromptSuggestionProps {
  title: string;
  description: string;
  onClick: () => void;
}

export function PromptSuggestion({ title, description, onClick }: PromptSuggestionProps) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-56 bg-gray-100 rounded-xl p-2.5 text-left hover:shadow-md hover:bg-gray-200 transition-all border border-gray-200"
    >
      <p className="text-sm text-gray-800 leading-tight mb-0.5">
        <strong>{title}</strong>
      </p>
      <p className="text-xs text-gray-600 leading-tight">{description}</p>
    </button>
  );
}
