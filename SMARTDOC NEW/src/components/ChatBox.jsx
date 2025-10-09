import React, { useState } from 'react';

function ChatBox() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleSubmit = async () => {
    // Simulate sending question and getting answer
    setAnswer(`Answer for: "${question}"`);
    setQuestion('');
  };

  return (
    <div className="flex flex-col gap-4">
      <textarea
        className="p-2 border rounded"
        placeholder="Ask your question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleSubmit}
      >
        Send
      </button>
      <div className="mt-4 bg-white p-4 border rounded shadow">
        {answer && <p>{answer}</p>}
      </div>
    </div>
  );
}

export default ChatBox;
