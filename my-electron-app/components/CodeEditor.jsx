import React from 'react';
import './CodeEditor.css';

/**
 * A simple code editor component with line numbers.
 * It behaves like a normal textarea, accepting a `value` and `onChange` prop.
 */
const CodeEditor = ({ value, onChange, placeholder, disabled }) => {
  // Calculate line numbers based on the value
  const lineCount = value.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

  // Sync scrolling between line numbers and textarea
  const handleScroll = (e) => {
    const lineNumbersEl = e.target.previousSibling;
    if (lineNumbersEl) {
      lineNumbersEl.scrollTop = e.target.scrollTop;
    }
  };

  return (
    <div className="code-editor-container">
      <textarea
        className="line-numbers"
        value={lineNumbers}
        readOnly
        aria-hidden="true"
      />
      <textarea
        className="code-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        onScroll={handleScroll}
        spellCheck="false"
      />
    </div>
  );
};

export default CodeEditor;

