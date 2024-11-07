


// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/router';
// import { signIn, signOut, useSession } from 'next-auth/react';
// import { deleteCookie } from 'cookies-next';
// import { io } from 'socket.io-client';
// import { FaGoogle, FaClock } from 'react-icons/fa';

// let socket;

// const Home = () => {
//   const [documents, setDocuments] = useState([]);
//   const [title, setTitle] = useState('');
//   const [manualName, setManualName] = useState('');
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState([]);
//   const { data: session } = useSession();
//   const router = useRouter();

//   useEffect(() => {
//     if (session) {
//       axios
//         .get('http://localhost:4000/api/documents')
//         .then((res) => setDocuments(res.data))
//         .catch((err) => console.error(err));

//       socket = io('http://localhost:4000');
//       socket.emit('join-room', 'document-room', session.user.id);

//       socket.on('receive-message', ({ msg, sender }) => {
//         setMessages((prevMessages) => [...prevMessages, { msg, sender, timestamp: new Date().toLocaleTimeString() }]);
//       });

//       socket.on('private-message', ({ msg, from }) => {
//         setMessages((prevMessages) => [...prevMessages, { msg, sender: from, private: true, timestamp: new Date().toLocaleTimeString() }]);
//       });

//       return () => {
//         socket.disconnect();
//       };
//     }
//   }, [session]);

//   const createDocument = async () => {
//     if (!title) return alert('Title is required');
//     const owner = session?.user?.name || manualName;
//     if (!owner) return alert('Owner is required');
//     try {
//       const res = await axios.post('http://localhost:4000/api/documents', { title, owner });
//       setDocuments([...documents, res.data]);
//       setTitle('');
//     } catch (error) {
//       console.error(error);
//       alert(error.response?.data?.error || 'Error creating document');
//     }
//   };

//   const handleSignOut = async () => {
//     await signOut({ redirect: false });
//     deleteCookie('next-auth.session-token');
//     deleteCookie('next-auth.csrf-token');
//     router.reload();
//   };

//   const sendMessage = () => {
//     if (message.trim()) {
//       socket.emit('send-message', { msg: message, roomId: 'document-room' });
//       setMessages((prevMessages) => [...prevMessages, { msg: message, sender: 'You', timestamp: new Date().toLocaleTimeString() }]);
//       setMessage('');
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold mb-4">Collaborative Documents</h1>

//       {!session ? (
//         <>
//           <h2>You are not signed in</h2>
//           <button onClick={() => signIn('google')} className="bg-blue-500 text-white p-2 flex items-center">
//             <FaGoogle className="mr-2" /> Sign in with Google
//           </button>
//           <div className="mt-6 p-4 border-t">
//             <h2 className="text-xl font-semibold mb-2">About This Project</h2>
//             <p className="mb-4">
//               This collaborative document platform allows users to create and manage documents with real-time chat functionality. The key components include:
//             </p>
//             <ul className="list-disc ml-6 space-y-2">
//               <li><strong>Document Management:</strong> Users can create, view, and update collaborative documents in a shared workspace.</li>
//               <li><strong>Real-Time Chat:</strong> A chat system enables users to communicate with each other, sending both public and private messages.</li>
//               <li><strong>Authentication:</strong> Secure authentication using Google sign-in ensures user identity and secure access control.</li>
//               <li><strong>Notifications and Updates:</strong> Documents show the last modified time, allowing users to track changes easily.</li>
//             </ul>
//             <p className="mt-4">
//               Sign in to explore and participate in this collaborative environment!
//             </p>
//           </div>
//         </>
//       ) : (
//         <>
//           <h2>Welcome, {session.user.name}</h2>
//           <img src={session.user.image} alt={session.user.name} className="mb-4 w-12 h-12 rounded-full" />
//           <button onClick={handleSignOut} className="bg-red-500 text-white p-2">
//             Sign out
//           </button>

//           <input
//             type="text"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             placeholder="Document title"
//             className="border p-2 mb-4"
//           />
//           <button onClick={createDocument} className="bg-blue-500 text-white p-2">
//             Create New Document
//           </button>

//           <div className="mt-6">
//             <h2 className="text-2xl font-semibold mb-2">Documents</h2>
//             <ul>
//               {documents.map((doc) => (
//                 <li key={doc._id} className="mb-2">
//                   <button
//                     onClick={() => router.push(`/document/${doc._id}`)}
//                     className="text-blue-500 underline"
//                   >
//                     {doc.title} (Version: {doc.version})
//                   </button>
//                   <div className="text-sm text-gray-500 flex items-center">
//                     <FaClock className="mr-1" /> Last Modified: {new Date(doc.updatedAt).toLocaleString()}
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <div className="mt-6">
//             <h2 className="text-2xl font-semibold mb-2">Chat</h2>
//             <div className="border p-4 h-64 overflow-y-scroll mb-4">
//               {messages.map((msg, idx) => (
//                 <div key={idx} className={`mb-2 ${msg.private ? 'text-gray-500' : ''}`}>
//                   <strong>{msg.sender}</strong>: {msg.msg} <span className="text-xs text-gray-400">({msg.timestamp})</span>
//                 </div>
//               ))}
//             </div>
//             <input
//               type="text"
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               placeholder="Type a message"
//               className="border p-2 w-full mb-2"
//             />
//             <button onClick={sendMessage} className="bg-blue-500 text-white p-2">
//               Send Message
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default Home;
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { signIn, signOut, useSession } from 'next-auth/react';
import { deleteCookie } from 'cookies-next';
import { io } from 'socket.io-client';
import { FaGoogle, FaClock } from 'react-icons/fa';

let socket;

const Home = () => {
  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState('');
  const [manualName, setManualName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      axios
        .get('https://real-doc.onrender.com/api/documents')
        .then((res) => setDocuments(res.data))
        .catch((err) => console.error(err));

      socket = io('https://real-doc.onrender.com');
      socket.emit('join-room', 'document-room', session.user.id);

      socket.on('receive-message', ({ msg, sender }) => {
        setMessages((prevMessages) => [...prevMessages, { msg, sender, timestamp: new Date().toLocaleTimeString() }]);
      });

      socket.on('private-message', ({ msg, from }) => {
        setMessages((prevMessages) => [...prevMessages, { msg, sender: from, private: true, timestamp: new Date().toLocaleTimeString() }]);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [session]);

  const createDocument = async () => {
    if (!title) return alert('Title is required');
    const owner = session?.user?.name || manualName;
    if (!owner) return alert('Owner is required');
    try {
      const res = await axios.post('https://real-doc.onrender.com/api/documents', { title, owner });
      setDocuments([...documents, res.data]);
      setTitle('');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Error creating document');
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    deleteCookie('next-auth.session-token');
    deleteCookie('next-auth.csrf-token');
    router.reload();
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('send-message', { msg: message, roomId: 'document-room' });
      setMessages((prevMessages) => [...prevMessages, { msg: message, sender: 'You', timestamp: new Date().toLocaleTimeString() }]);
      setMessage('');
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-4xl font-bold text-blue-600 mb-6 text-center">Collaborative Documents</h1>

        {!session ? (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Welcome to Document Collaboration</h2>
            <p className="mb-6 text-gray-600">Please sign in to access the platform.</p>
            <button
              onClick={() => signIn('google')}
              className="flex items-center justify-center w-full bg-blue-500 text-white py-3 px-6 rounded-lg shadow hover:bg-blue-600"
            >
              <FaGoogle className="mr-2" /> Sign in with Google
            </button>
            <div className="mt-8 p-6 bg-blue-50 rounded-lg shadow-lg text-left">
              <h2 className="text-2xl font-semibold mb-4 text-blue-700">About This Platform</h2>
              <ul className="space-y-3">
                <li><strong>Document Management:</strong> Create, view, and update collaborative documents.</li>
                <li><strong>Real-Time Chat:</strong> Engage in public and private conversations in real time.</li>
                <li><strong>Authentication:</strong> Google sign-in for secure access control.</li>
                <li><strong>Notifications:</strong> Track document modifications and updates.</li>
              </ul>
              <p className="mt-4 text-gray-600">Sign in to explore this collaborative environment!</p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-700">Welcome, {session.user.name}</h2>
                <img src={session.user.image} alt={session.user.name} className="mt-2 w-16 h-16 rounded-full mx-auto shadow" />
              </div>
              <button onClick={handleSignOut} className="bg-red-500 text-white py-2 px-4 rounded shadow hover:bg-red-600">
                Sign out
              </button>
            </div>

            <div className="my-8">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter document title"
                className="w-full p-4 border border-blue-200 rounded-lg shadow-sm mb-4"
              />
              <button
                onClick={createDocument}
                className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-lg hover:bg-blue-700"
              >
                Create New Document
              </button>
            </div>

            <div className="my-8">
              <h2 className="text-2xl font-semibold text-blue-600 mb-4">Documents</h2>
              <ul className="space-y-4">
                {documents.map((doc) => (
                  <li key={doc._id} className="p-4 bg-blue-50 rounded-lg shadow hover:bg-blue-100 transition">
                    <button
                      onClick={() => router.push(`/document/${doc._id}`)}
                      className="text-blue-700 font-semibold text-lg underline"
                    >
                      {doc.title} <span className="text-gray-500">(Version: {doc.version})</span>
                    </button>
                    <div className="text-sm text-gray-500 mt-1 flex items-center">
                      <FaClock className="mr-1" /> Last Modified: {new Date(doc.updatedAt).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="my-8">
              <h2 className="text-2xl font-semibold text-blue-600 mb-4">Chat</h2>
              <div className="border rounded-lg shadow overflow-y-scroll h-64 p-4 bg-blue-50">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`mb-2 ${msg.private ? 'text-gray-500' : ''}`}>
                    <strong>{msg.sender}</strong>: {msg.msg} <span className="text-xs text-gray-400">({msg.timestamp})</span>
                  </div>
                ))}
              </div>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message"
                className="w-full p-4 mt-4 border border-blue-200 rounded-lg shadow-sm"
              />
              <button onClick={sendMessage} className="w-full bg-blue-600 text-white py-3 rounded-lg mt-2 shadow-lg hover:bg-blue-700">
                Send Message
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/router';
// import { signIn, signOut, useSession } from 'next-auth/react';
// import { deleteCookie } from 'cookies-next';
// import { io } from 'socket.io-client';
// import { FaGoogle, FaClock } from 'react-icons/fa';

// let socket;

// const Home = () => {
//   const [documents, setDocuments] = useState([]);
//   const [title, setTitle] = useState('');
//   const [manualName, setManualName] = useState('');
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState([]);
//   const [signedIn, setSignedIn] = useState(false);  // Track if sign-in is initiated
//   const { data: session } = useSession({ required: signedIn });
//   const router = useRouter();

//   useEffect(() => {
    
//     if (session) {
//       axios
//         .get('http://localhost:4000/api/documents')
//         .then((res) => setDocuments(res.data))
//         .catch((err) => console.error(err));

//       socket = io('http://localhost:4000');
//       socket.emit('join-room', 'document-room', session.user.id);

//       socket.on('receive-message', ({ msg, sender }) => {
//         setMessages((prevMessages) => [...prevMessages, { msg, sender, timestamp: new Date().toLocaleTimeString() }]);
//       });

//       socket.on('private-message', ({ msg, from }) => {
//         setMessages((prevMessages) => [...prevMessages, { msg, sender: from, private: true, timestamp: new Date().toLocaleTimeString() }]);
//       });

//       return () => {
//         socket.disconnect();
//       };
//     }
//   }, [session]);
//   const createDocument = async () => {
//     if (!title) {
//       console.error("Please provide a document title.");
//       return;
//     }
//     try {
//       await axios.post("http://localhost:4000/api/documents", {
//         title,
//         owner: session.user.name,
//         ownerId: session.user.id, // Pass the ownerId here
//       });
//       fetchDocuments(); // Reload documents list after creation
//     } catch (error) {
//       console.error("Error creating document:", error);
//     }
//   };
  
  
  

//   const handleSignOut = async () => {
//     await signOut({ redirect: false });
//     deleteCookie('next-auth.session-token');
//     deleteCookie('next-auth.csrf-token');
//     router.reload();
//   };

//   const sendMessage = () => {
//     if (message.trim()) {
//       socket.emit('send-message', { msg: message, roomId: 'document-room' });
//       setMessages((prevMessages) => [...prevMessages, { msg: message, sender: 'You', timestamp: new Date().toLocaleTimeString() }]);
//       setMessage('');
//     }
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold mb-4">Collaborative Documents</h1>

//       {!session ? (
//         <>
//           <h2>You are not signed in</h2>
//           <button 
//             onClick={() => {
//               setSignedIn(true); // Initiate sign-in when clicked
//               signIn('google');
//             }} 
//             className="bg-blue-500 text-white p-2 flex items-center"
//           >
//             <FaGoogle className="mr-2" /> Sign in with Google
//           </button>
//           <div className="mt-6 p-4 border-t">
//             <h2 className="text-xl font-semibold mb-2">About This Project</h2>
//             <p className="mb-4">
//               This collaborative document platform allows users to create and manage documents with real-time chat functionality. The key components include:
//             </p>
//             <ul className="list-disc ml-6 space-y-2">
//               <li><strong>Document Management:</strong> Users can create, view, and update collaborative documents in a shared workspace.</li>
//               <li><strong>Real-Time Chat:</strong> A chat system enables users to communicate with each other, sending both public and private messages.</li>
//               <li><strong>Authentication:</strong> Secure authentication using Google sign-in ensures user identity and secure access control.</li>
//               <li><strong>Notifications and Updates:</strong> Documents show the last modified time, allowing users to track changes easily.</li>
//             </ul>
//             <p className="mt-4">
//               Sign in to explore and participate in this collaborative environment!
//             </p>
//           </div>
//         </>
//       ) : (
//         <>
//           <h2>Welcome, {session.user.name}</h2>
//           <img src={session.user.image} alt={session.user.name} className="mb-4 w-12 h-12 rounded-full" />
//           <button onClick={handleSignOut} className="bg-red-500 text-white p-2">
//             Sign out
//           </button>

//           <input
//             type="text"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             placeholder="Document title"
//             className="border p-2 mb-4"
//           />
//           <button onClick={createDocument} className="bg-blue-500 text-white p-2">
//             Create New Document
//           </button>

//           <div className="mt-6">
//             <h2 className="text-2xl font-semibold mb-2">Documents</h2>
//             <ul>
//               {documents.map((doc) => (
//                 <li key={doc._id} className="mb-2">
//                   <button
//                     onClick={() => router.push(`/document/${doc._id}`)}
//                     className="text-blue-500 underline"
//                   >
//                     {doc.title} (Version: {doc.version})
//                   </button>
//                   <div className="text-sm text-gray-500 flex items-center">
//                     <FaClock className="mr-1" /> Last Modified: {new Date(doc.updatedAt).toLocaleString()}
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <div className="mt-6">
//             <h2 className="text-2xl font-semibold mb-2">Chat</h2>
//             <div className="border p-4 h-64 overflow-y-scroll mb-4">
//               {messages.map((msg, idx) => (
//                 <div key={idx} className={`mb-2 ${msg.private ? 'text-gray-500' : ''}`}>
//                   <strong>{msg.sender}</strong>: {msg.msg} <span className="text-xs text-gray-400">({msg.timestamp})</span>
//                 </div>
//               ))}
//             </div>
//             <input
//               type="text"
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               placeholder="Type a message"
//               className="border p-2 w-full mb-2"
//             />
//             <button onClick={sendMessage} className="bg-blue-500 text-white p-2">
//               Send Message
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default Home;
