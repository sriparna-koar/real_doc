
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/router';
// import io from 'socket.io-client';
// import axios from 'axios';

// let socket;

// const DocumentPage = ({ currentUser }) => {
//   const [content, setContent] = useState('');
  
//   const router = useRouter();
//   const { id } = router.query;

//   useEffect(() => {
//     if (!id) return;
  
//     // Fetch the document content from the backend
//     axios.get(`http://localhost:4000/api/documents/${id}`)
//       .then((res) => {
//         console.log('Fetched document:', res.data); // Debugging line
//         setContent(res.data.content); // Load document content
//       })
//       .catch((err) => {
//         console.error(err);
//         alert('Error loading document');
//       });
  
//     // Initialize socket connection for real-time editing
//     socket = io('http://localhost:4000');
//     socket.emit('join_document', id, currentUser);
  
//     // Listen for real-time document edits from other users
//     socket.on('edit_document', (updatedContent) => {
//       console.log('Received updated content:', updatedContent); // Debugging line
//       setContent(updatedContent.content); // Update content in real-time
//     });
  
//     // Disconnect socket on cleanup
//     return () => {
//       socket.disconnect();
//     };
//   }, [id, currentUser]);
  

//   const handleEdit = (e) => {
//     const newContent = e.target.value;
//     setContent(newContent);
//     socket.emit('edit_document', { docId: id, content: newContent });
//   };

//   const handleSave = () => {
//     axios.put(`http://localhost:4000/api/documents/${id}`, { content })
//       .then(() => alert('Document saved successfully'))
//       .catch((err) => {
//         console.error(err);
//         alert(err.response?.data?.error || 'Error saving document');
//       });
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold mb-4">Collaborative Editor</h1>
//       <textarea
//         value={content}
//         onChange={handleEdit}
//         rows="20"
//         className="w-full border border-gray-300 rounded p-4"
//       />
//       <button onClick={handleSave} className="bg-green-500 text-white p-2 mt-4">Save</button>
//     </div>
//   );
// };

// export default DocumentPage;
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-toastify';
let socket;

const DocumentPage = ({ currentUser }) => {
  const [content, setContent] = useState('');
  const [suggestedText, setSuggestedText] = useState('');
  const [userCursors, setUserCursors] = useState({});
  const router = useRouter();
  const { id } = router.query;
  const textareaRef = useRef(null);

  const colors = {}; // Assign colors to each user
  const assignColorToUser = (userId) => {
    if (!colors[userId]) {
      colors[userId] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    }
    return colors[userId];
  };
  useEffect(() => {
    if (!id) return;

    // Fetch the document content from the backend
    axios.get(`https://real-doc.onrender.com/api/documents/${id}`)
      .then((res) => setContent(res.data.content))
      .catch((err) => alert('Error loading document'));

    // Initialize socket connection
    socket = io('https://real-doc.onrender.com');
    socket.emit('join_document', id, currentUser);

    socket.on('edit_document', (updatedContent) => {
      setContent(updatedContent.content);
    });

    socket.on('cursor_position', ({ cursorPosition, user }) => {
      if (user) {
        setUserCursors((prev) => ({
          ...prev,
          [user.id]: {
            ...cursorPosition,
            color: assignColorToUser(user.id),
          },
        }));
      }
    });
    return () => socket.disconnect();
  }, [id, currentUser]);
  const handleSuggestion = async () => {
    try {
      const { data } = await axios.post('https://real-doc.onrender.comapi/suggest', { text: content });
      setSuggestedText(data.suggestion);
    } catch (error) {
      console.error('Error fetching suggestion:', error.response?.data || error.message);
      toast.error('Error fetching suggestion');
    }
  };
  
  
  const handleEdit = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    socket.emit('edit_document', { docId: id, content: newContent });
  };

  const handleCursorChange = (e) => {
    const cursorPosition = e.target.selectionStart;
    socket.emit('cursor_position', { docId: id, cursorPosition, user: currentUser });
  };
  const handleSave = () => {
    // axios.put(`http://localhost:4000/api/documents/${id}`, { content })
    axios.put(`https://real-doc.onrender.com/api/documents/${id}`, { content })
      .then((response) => {
        alert('Document saved successfully');
        setDocuments((prevDocuments) =>
          prevDocuments.map((doc) =>
            doc._id === id ? { ...doc, updatedAt: response.data.updatedAt } : doc
          )
        );
      })
      .catch((err) => alert('Error saving document'));
  };
  
  // const handleSave = () => {
  //   axios.put(`http://localhost:4000/api/documents/${id}`, { content })
  //     .then(() => alert('Document saved successfully'))
  //     .catch((err) => alert('Error saving document'));
  // };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Collaborative Editor</h1>
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleEdit}
        onSelect={handleCursorChange}
        rows="20"
        className="w-full border border-gray-300 rounded p-4"
      />
      <button onClick={handleSave} className="bg-green-500 text-white p-2 mt-4">Save</button>

      <div>
        {Object.keys(userCursors).map((userId) => (
          <div
            key={userId}
            style={{
              position: 'absolute',
              left: `${userCursors[userId].left}px`,
              top: `${userCursors[userId].top}px`,
              color: userCursors[userId].color,
            }}
          >
            {userCursors[userId].name}
          </div>
        ))}
      </div>
      <button onClick={handleSuggestion} className="bg-blue-500 text-white p-2 mt-4">Get Suggestion</button>
      {suggestedText && (
        <div className="mt-4 p-4 border border-blue-500 bg-blue-50">
          <p><strong>Suggestion:</strong> {suggestedText}</p>
        </div>
      )}
    
    </div>
  );
};

export default DocumentPage;
// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/router';
// import io from 'socket.io-client';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// let socket;

// const DocumentPage = ({ currentUser }) => {
//   const [content, setContent] = useState('');
//   const [suggestedText, setSuggestedText] = useState('');
//   const [userCursors, setUserCursors] = useState({});
//   const [documents, setDocuments] = useState([]); // State to hold all documents owned by user
//   const router = useRouter();
//   const { id } = router.query;
//   const textareaRef = useRef(null);

//   const colors = {}; // Assign colors to each user
//   const assignColorToUser = (userId) => {
//     if (!colors[userId]) {
//       colors[userId] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
//     }
//     return colors[userId];
//   };

//   // Fetch all documents owned by the user on component mount
//   useEffect(() => {
//     if (currentUser) {
//       axios.get(`http://localhost:4000/api/documents?userId=${currentUser.id}`)
//         .then((res) => setDocuments(res.data))
//         .catch((err) => console.error('Error fetching documents:', err));
//     }
//   }, [currentUser]);

//   useEffect(() => {
//     if (!id) return;

//     // Fetch the document content from the backend
//     axios.get(`http://localhost:4000/api/documents/${id}`)
//       .then((res) => setContent(res.data.content))
//       .catch((err) => alert('Error loading document'));

//     // Initialize socket connection
//     socket = io('http://localhost:4000');
//     socket.emit('join_document', id, currentUser);

//     socket.on('edit_document', (updatedContent) => {
//       setContent(updatedContent.content);
//     });

//     socket.on('cursor_position', ({ cursorPosition, user }) => {
//       if (user) {
//         setUserCursors((prev) => ({
//           ...prev,
//           [user.id]: {
//             ...cursorPosition,
//             color: assignColorToUser(user.id),
//           },
//         }));
//       }
//     });
//     return () => socket.disconnect();
//   }, [id, currentUser]);

//   const handleSuggestion = async () => {
//     try {
//       const { data } = await axios.post('http://localhost:4000/api/suggest', { text: content });
//       setSuggestedText(data.suggestion);
//     } catch (error) {
//       console.error('Error fetching suggestion:', error.response?.data || error.message);
//       toast.error('Error fetching suggestion');
//     }
//   };

//   const handleEdit = (e) => {
//     const newContent = e.target.value;
//     setContent(newContent);
//     socket.emit('edit_document', { docId: id, content: newContent });
//   };

//   const handleCursorChange = (e) => {
//     const cursorPosition = e.target.selectionStart;
//     socket.emit('cursor_position', { docId: id, cursorPosition, user: currentUser });
//   };

//   const handleSave = () => {
//     axios.put(`http://localhost:4000/api/documents/${id}`, { content })
//       .then(() => alert('Document saved successfully'))
//       .catch((err) => alert('Error saving document'));
//   };

//   // Delete document function
//   const handleDelete = async (docId) => {
//     try {
//       await axios.delete(`http://localhost:4000/api/documents/${docId}`, { params: { userId: currentUser.id } });
//       setDocuments(documents.filter(doc => doc._id !== docId)); // Update state to remove deleted document
//       toast.success('Document deleted successfully');
//     } catch (error) {
//       console.error('Error deleting document:', error);
//       toast.error('Failed to delete document');
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold mb-4">Collaborative Editor</h1>

//       <h2 className="text-2xl font-bold mb-4">Your Documents</h2>
//       <ul>
//         {documents.map((doc) => (
//           <li key={doc._id} className="border p-2 mb-2 flex justify-between items-center">
//             <span onClick={() => router.push(`/documents/${doc._id}`)} className="cursor-pointer">
//               {doc.title}
//             </span>
//             <button
//               onClick={() => handleDelete(doc._id)}
//               className="bg-red-500 text-white p-1 rounded"
//             >
//               Delete
//             </button>
//           </li>
//         ))}
//       </ul>

//       <textarea
//         ref={textareaRef}
//         value={content}
//         onChange={handleEdit}
//         onSelect={handleCursorChange}
//         rows="20"
//         className="w-full border border-gray-300 rounded p-4"
//       />
//       <button onClick={handleSave} className="bg-green-500 text-white p-2 mt-4">Save</button>

//       <div>
//         {Object.keys(userCursors).map((userId) => (
//           <div
//             key={userId}
//             style={{
//               position: 'absolute',
//               left: `${userCursors[userId].left}px`,
//               top: `${userCursors[userId].top}px`,
//               color: userCursors[userId].color,
//             }}
//           >
//             {userCursors[userId].name}
//           </div>
//         ))}
//       </div>
//       <button onClick={handleSuggestion} className="bg-blue-500 text-white p-2 mt-4">Get Suggestion</button>
//       {suggestedText && (
//         <div className="mt-4 p-4 border border-blue-500 bg-blue-50">
//           <p><strong>Suggestion:</strong> {suggestedText}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DocumentPage;
// import { useState, useEffect, useRef } from 'react';
// import { useRouter } from 'next/router';
// import io from 'socket.io-client';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// let socket;

// const DocumentPage = ({ currentUser }) => {
//   const [content, setContent] = useState('');
//   const [suggestedText, setSuggestedText] = useState('');
//   const [userCursors, setUserCursors] = useState({});
//   const [documents, setDocuments] = useState([]);
//   const router = useRouter();
//   const { id } = router.query;

//   const fetchDocuments = async () => {
//     try {
//       console.log("Fetching documents for user:", currentUser.id); // Debugging line
//       const { data } = await axios.get(`http://localhost:4000/api/documents?userId=${currentUser.id}`);
//       setDocuments(data);
//     } catch (err) {
//       console.error("Error fetching documents:", err);
//     }
//   };
  

//   useEffect(() => {
//     if (currentUser) fetchDocuments();
//   }, [currentUser]);

//   useEffect(() => {
//     if (!id) return;

//     axios.get(`http://localhost:4000/api/documents/${id}`)
//       .then((res) => setContent(res.data.content))
//       .catch(() => alert('Error loading document'));

//     socket = io('http://localhost:4000');
//     socket.emit('join_document', id, currentUser);

//     socket.on('edit_document', (updatedContent) => setContent(updatedContent.content));

//     return () => socket.disconnect();
//   }, [id, currentUser]);

//   const handleEdit = (e) => {
//     const newContent = e.target.value;
//     setContent(newContent);
//     socket.emit('edit_document', { docId: id, content: newContent });
//   };

//   const handleSave = () => {
//     axios.put(`http://localhost:4000/api/documents/${id}`, { content })
//       .then(() => toast.success('Document saved successfully'))
//       .catch(() => toast.error('Error saving document'));
//   };

//   const handleSuggestion = async () => {
//     try {
//       const { data } = await axios.post('http://localhost:4000/api/suggest', { text: content });
//       setSuggestedText(data.suggestion);
//     } catch (error) {
//       toast.error('Error fetching suggestion');
//     }
//   };

//   return (
//     <div>
//       <h1>Your Documents</h1>
//       <ul>
//         {documents.map((doc) => (
//           <li key={doc._id}>
//             <span onClick={() => router.push(`/documents/${doc._id}`)}>{doc.title}</span>
//             <button onClick={() => handleDelete(doc._id)}>Delete</button>
//           </li>
//         ))}
//       </ul>

//       <textarea value={content} onChange={handleEdit} rows="10" />
//       <button onClick={handleSave}>Save</button>
//       <button onClick={handleSuggestion}>Get Suggestion</button>

//       {suggestedText && <p>{suggestedText}</p>}
//     </div>
//   );
// };

// export default DocumentPage;
