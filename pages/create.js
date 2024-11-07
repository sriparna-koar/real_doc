// import { useState } from 'react';
// import { useRouter } from 'next/router';
// import axios from 'axios';

// export default function CreateDocument() {
//   const [title, setTitle] = useState('');
//   const router = useRouter();

//   const createDocument = async () => {
//     try {
//       const res = await axios.post('http://localhost:4000/api/documents', { title });
//       router.push(`/documents/${res.data.id}`);
//     } catch (error) {
//       console.error('Error creating document:', error);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-8">
//       <h1 className="text-2xl font-bold mb-4">Create New Document</h1>
//       <input
//         type="text"
//         placeholder="Document Title"
//         value={title}
//         onChange={(e) => setTitle(e.target.value)}
//         className="p-2 border border-gray-300 rounded mb-4 w-full"
//       />
//       <button onClick={createDocument} className="px-4 py-2 bg-green-600 text-white rounded">
//         Create Document
//       </button>
//     </div>
//   );
// }
import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function CreateDocument() {
  const [title, setTitle] = useState('');
  const router = useRouter();

  const createDocument = async () => {
    try {
      const res = await axios.post('http://localhost:4000/api/documents', { title });
      router.push(`/documents/${res.data.id}`);
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };
  const [comments, setComments] = useState([]);
  const [selectedText, setSelectedText] = useState('');
  const [commentText, setCommentText] = useState('');
  
  const handleTextSelect = () => {
    const text = window.getSelection().toString();
    setSelectedText(text);
  };
  
  const addComment = () => {
    axios.post(`http://localhost:4000/api/documents/${id}/comments`, { comment: commentText, position: content.indexOf(selectedText) })
      .then(() => {
        setComments([...comments, { comment: commentText, position: content.indexOf(selectedText) }]);
        setCommentText('');
      });
  };
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-4">Create New Document</h1>
      <input
        type="text"
        placeholder="Document Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="p-2 border border-gray-300 rounded mb-4 w-full"
      />
      <div onMouseUp={handleTextSelect}>
    <textarea value={content} onChange={handleEdit} rows="20" className="w-full border border-gray-300 rounded p-4" />
    {selectedText && (
      <div>
        <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment" />
        <button onClick={addComment}>Add Comment</button>
      </div>
    )}
    <div>
      {comments.map((comment, idx) => (
        <p key={idx}>
          <strong>Comment:</strong> {comment.comment}
        </p>
      ))}
    </div>
  </div>
      <button onClick={createDocument} className="px-4 py-2 bg-green-600 text-white rounded">
        Create Document
      </button>
    </div>
  );
}
