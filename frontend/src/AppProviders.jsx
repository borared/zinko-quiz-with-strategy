import { BrowserRouter } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import App from './App.jsx';

export default function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <SocketProvider>
        <ToastProvider>{children ?? <App />}</ToastProvider>
      </SocketProvider>
    </BrowserRouter>
  );
}
