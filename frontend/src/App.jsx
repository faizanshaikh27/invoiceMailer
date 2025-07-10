import React, { useState } from 'react';
import axios from 'axios';
import { CloudUpload } from 'lucide-react';

export default function App() {
  const [files, setFiles] = useState([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleUpload = async () => {
    if (files.length === 0 || !email) {
      setMessage("Please select files and enter an email address.");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append('invoices', file));
    formData.append('email', email);

    try {
      setLoading(true);
      setMessage('');
      const res = await axios.post('http://localhost:5000/upload', formData);
      setMessage(res.data.message);
    } catch (err) {
      setMessage('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-sky-100 to-pink-100 px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-2xl border border-gray-200">
        <div className="text-center mb-8">
          <CloudUpload className="mx-auto h-12 w-12 text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-800 mt-3">Invoice PDF Mailer</h1>
          <p className="text-gray-500 text-sm mt-1">Upload invoice images and email them as a single PDF</p>
        </div>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter recipient email"
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0 file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-3 rounded-xl transition duration-200"
        >
          {loading ? 'Processing...' : '📤 Upload & Send Email'}
        </button>

        {message && (
          <p className="mt-6 text-center text-green-600 bg-green-50 p-3 rounded-lg font-medium shadow-sm">
            ✅ {message}
          </p>
        )}
      </div>
    </div>
  );
}
