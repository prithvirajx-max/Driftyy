interface TagSelectorProps {
  options: string[];
  selected: string[];
  onChange: (tag: string) => void;
  className?: string;
}

export default function TagSelector({
  options,
  selected,
  onChange,
  className = ""
}: TagSelectorProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            selected.includes(option)
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}