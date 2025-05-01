import React, { useState } from 'react';

export default function ReportForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit({ title, details });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Report title"
      />
      <textarea
        value={details}
        onChange={e => setDetails(e.target.value)}
        placeholder="Describe the issue"
      />
      <button type="submit">Submit Report</button>
    </form>
  );
}
