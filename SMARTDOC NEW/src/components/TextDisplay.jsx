import React from 'react';

function TextDisplay() {
  // Simulate extracted text
  const text = `This is the full extracted text from the uploaded document...`;

  return (
    <div className="whitespace-pre-wrap text-gray-800">
      {text}
    </div>
  );
}

export default TextDisplay;
