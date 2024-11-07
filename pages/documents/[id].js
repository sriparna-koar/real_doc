// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import dynamic from 'next/dynamic';
// import axios from 'axios';
// import useSocket from '../../hooks/useSocket';

// const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

// export default function DocumentEditor() {
//   const router = useRouter();
//   const { id } = router.query;
//   const [content, setContent] = useState('');
//   const [title, setTitle] = useState('');
//   const [version, setVersion] = useState(1);
//   const socket = useSocket(id);

//   useEffect(() => {
//     if (id) {
//       axios.get(`http://localhost:4000/api/documents/${id}`).then((res) => {
//         setContent(res.data.content);
//         setTitle(res.data.title);
//         setVersion(res.data.version);
//       });
//     }
//   }, [id]);

//   const saveDocument = async () => {
//     await axios.put(`http://localhost:4000/api/documents/${id}`, { content });
//     alert('Document saved!');
//   };

//   return (
//     <div className="min-h-screen p-8 bg-gray-100">
//       <h1 className="text-2xl font-bold mb-4">{title} (v{version})</h1>
//       <ReactQuill value={content} onChange={(newContent) => setContent(newContent)} />
//       <button onClick={saveDocument} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
//         Save Document
//       </button>
//     </div>
//   );
// }
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import dynamic from 'next/dynamic';
// import axios from 'axios';
// import useSocket from '../../hooks/useSocket';

// const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

// export default function DocumentEditor() {
//   const router = useRouter();
//   const { id } = router.query;
//   const [content, setContent] = useState('');
//   const [title, setTitle] = useState('');
//   const [version, setVersion] = useState(1);
//   const socket = useSocket(id);

//   useEffect(() => {
//     if (id) {
//       axios.get(`http://localhost:4000/api/documents/${id}`).then((res) => {
//         setContent(res.data.content);
//         setTitle(res.data.title);
//         setVersion(res.data.version);
//       });
//     }
//   }, [id]);

//   // Listen for real-time document updates
//   useEffect(() => {
//     if (socket) {
//       socket.on('document_update', (data) => {
//         setContent(data.content);
//         alert('Document updated!');
//       });

//       return () => socket.off('document_update');
//     }
//   }, [socket]);

//   const handleContentChange = (newContent) => {
//     setContent(newContent);
//     socket.emit('edit_document', { docId: id, content: newContent });
//   };

//   const saveDocument = async () => {
//     try {
//       await axios.put(`http://localhost:4000/api/documents/${id}`, { content });
//       alert('Document saved!');
//     } catch (error) {
//       console.error('Error saving document:', error);
//     }
//   };

//   return (
//     <div className="min-h-screen p-8 bg-gray-100">
//       <h1 className="text-2xl font-bold mb-4">{title} (v{version})</h1>
//       <ReactQuill value={content} onChange={handleContentChange} />
//       <button onClick={saveDocument} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
//         Save Document
//       </button>
//     </div>
//   );
// }
// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/router';
// import dynamic from 'next/dynamic';
// import axios from 'axios';
// import useSocket from '../../hooks/useSocket';

// const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

// export default function DocumentEditor() {
//   const router = useRouter();
//   const { id } = router.query;
//   const [content, setContent] = useState('');
//   const [title, setTitle] = useState('');
//   const [version, setVersion] = useState(1);
//   const socket = useSocket(id);
//   const quillRef = useRef(null); // Create a ref for Quill

//   useEffect(() => {
//     if (id) {
//       axios.get(`http://localhost:4000/api/documents/${id}`).then((res) => {
//         setContent(res.data.content);
//         setTitle(res.data.title);
//         setVersion(res.data.version);
//       });
//     }
//   }, [id]);

//   const saveDocument = async () => {
//     await axios.put(`http://localhost:4000/api/documents/${id}`, { content });
//     alert('Document saved!');
//   };

//   return (
//     <div className="min-h-screen p-8 bg-gray-100">
//       <h1 className="text-2xl font-bold mb-4">{title} (v{version})</h1>
//       <ReactQuill
//         ref={quillRef}
//         value={content}
//         onChange={(newContent) => setContent(newContent)}
//       />
//       <button onClick={saveDocument} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
//         Save Document
//       </button>
//     </div>
//   );
// }
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import axios from 'axios';
import useSocket from '../../hooks/useSocket';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function DocumentEditor() {
  const router = useRouter();
  const { id } = router.query;
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [version, setVersion] = useState(1);
  const socket = useSocket(id);
  const quillRef = useRef(null);

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:4000/api/documents/${id}`)
        .then((res) => {
          setContent(res.data.content);
          setTitle(res.data.title);
          setVersion(res.data.version);
        })
        .catch((err) => {
          console.error('Error fetching document:', err);
          alert('Document not found.');
        });
    }
  }, [id]);

  const saveDocument = async () => {
    await axios.put(`http://localhost:4000/api/documents/${id}`, { content });
    alert('Document saved!');
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">{title} (v{version})</h1>
      <ReactQuill
        ref={quillRef}
        value={content}
        onChange={(newContent) => setContent(newContent)}
      />
      <button onClick={saveDocument} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        Save Document
      </button>
    </div>
  );
}
