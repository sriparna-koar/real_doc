import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import io from 'socket.io-client';

let socket;

export default function Editor() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      const fetchDocument = async () => {
        const response = await axios.get(`http://localhost:4000/api/documents/${id}`);
        setContent(response.data.content);
        setTitle(response.data.title);
      };

      fetchDocument();
      socket = io('http://localhost:4000');
      socket.emit('join_document', id);

      // Listen for real-time updates
      socket.on('document_update', ({ content }) => {
        setContent(content);
      });

      return () => socket.disconnect(); // Clean up on component unmount
    }
  }, [id]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Emit the update event to the server
    socket.emit('edit_document', { docId: id, content: newContent });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <textarea 
        value={content}
        onChange={handleContentChange}
        className="w-full h-screen border p-4"
      ></textarea>
    </div>
  );
}
