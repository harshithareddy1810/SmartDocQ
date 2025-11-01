/*import React from 'react';

function FileUploader() {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const prevDocs = JSON.parse(localStorage.getItem('uploadedDocs')) || [];
      const updatedDocs = [...prevDocs, file.name];
      localStorage.setItem('uploadedDocs', JSON.stringify(updatedDocs));
      console.log('Uploaded file:', file.name);
      window.location.href = '/qa';
    }
  };

  return (
    <div className="mb-6">
      <input type="file" onChange={handleFileChange} />
    </div>
  );
}

export default FileUploader;*/


/*import React from 'react';

function FileUploader() {
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-gray-700 font-medium">Upload Document</span>
        <input
          type="file"
          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>
      <button
        className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition-shadow shadow-md"
      >
        Upload
      </button>
    </div>
  );
}

export default FileUploader;
*/

/*import React from 'react';
import { useNavigate } from 'react-router-dom';

function FileUploader() {
  const navigate = useNavigate();

  const handleUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const content = reader.result;
      const doc = {
        name: file.name,
        content: content,
        id: Date.now(), // unique ID
      };

      const docs = JSON.parse(localStorage.getItem('documents') || '[]');
      docs.push(doc);
      localStorage.setItem('documents', JSON.stringify(docs));

      // ✅ Redirect to QA page with that doc ID
      navigate(`/qa/${doc.id}`);
    };

    if (file) reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-gray-700 font-medium">Upload Document</span>
        <input
          type="file"
          onChange={handleUpload}
          className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>
    </div>
  );
}

export default FileUploader;*/

/*import React from 'react';
import { useNavigate } from 'react-router-dom';

function FileUploader() {
  const navigate = useNavigate();

  const handleUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const content = reader.result;
      const doc = {
        id: Date.now(),
        name: file.name,
        content,
      };

      const docs = JSON.parse(localStorage.getItem('documents') || '[]');
      docs.push(doc);
      localStorage.setItem('documents', JSON.stringify(docs));

      navigate(`/qa/${doc.id}`);
    };

    if (file) reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        onChange={handleUpload}
        className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export default FileUploader;*/


// src/components/FileUploader.jsx
/*import React from 'react';
import { useNavigate } from 'react-router-dom';

const FileUploader = () => {
  const navigate = useNavigate();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const fileText = e.target.result;

        const existingDocs = JSON.parse(localStorage.getItem('documents') || '[]');
        existingDocs.push({ name: file.name, content: fileText });
        localStorage.setItem('documents', JSON.stringify(existingDocs));

        // Navigate to QA page
        navigate('/qa');
      };

      reader.readAsText(file);
    }
  };

  return (
    <div className="text-center">
      <label className="bg-indigo-600 text-white px-6 py-2 rounded cursor-pointer hover:bg-indigo-700 transition">
        Upload Document
        <input type="file" onChange={handleFileUpload} className="hidden" />
      </label>
    </div>
  );
};

export default FileUploader;*/

/*const handleFileUpload = (event) => {
  const file = event.target.files[0];

  if (file) {
    console.log("File selected:", file.name); // ✅ Debug

    const reader = new FileReader();
    reader.onload = function (e) {
      const fileText = e.target.result;

      console.log("File loaded. Navigating to /qa"); // ✅ Debug

      const existingDocs = JSON.parse(localStorage.getItem('documents') || '[]');
      existingDocs.push({ name: file.name, content: fileText });
      localStorage.setItem('documents', JSON.stringify(existingDocs));

      navigate('/qa');
    };

    reader.readAsText(file);
  }
};*/
import React from 'react';
import { useNavigate } from 'react-router-dom';

const FileUploader = () => {
  const navigate = useNavigate();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const fileContent = reader.result;

      // Save content to sessionStorage instead of localStorage
      const fileId = Date.now().toString();
      sessionStorage.setItem(fileId, fileContent);

      // Redirect to QA page with fileId
      navigate(`/qa?id=${fileId}`);
    };

    reader.readAsText(file); // You can also use readAsDataURL or readAsArrayBuffer based on file type
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
      <label className="bg-white shadow-xl rounded-2xl px-6 py-12 text-center cursor-pointer hover:shadow-2xl transition">
        <p className="text-lg font-semibold text-gray-800 mb-4">Click to Upload Document</p>
        <input type="file" onChange={handleFileUpload} className="hidden" />
      </label>
    </div>
  );
};

export default FileUploader;

