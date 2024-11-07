import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const useSocket = (docId) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketInstance = io('http://localhost:4000');
    setSocket(socketInstance);

    socketInstance.emit('join_document', docId);

    return () => {
      socketInstance.disconnect();
    };
  }, [docId]);

  return socket;
};

export default useSocket;
