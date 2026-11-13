import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AlertProvider } from './context/AlertContext';
import Index from './pages/Index';
import Game1 from './pages/Game1';
import Game2 from './pages/Game2';
import Game3 from './pages/Game3';
import TempMail from './pages/TempMail';
import TempMailInbox from './pages/TempMailInbox';
import GuerrillaMailInbox from './pages/GuerrillaMailInbox';
import EmailDetail from './pages/EmailDetail';

const GuerrillaEmailDetailRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') || '';
  return <Navigate to={`/EmailDetail?id=${encodeURIComponent(id)}&provider=guerrilla`} replace />;
};

export default function App() {
  return (
    <AlertProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/Game1" element={<Game1 />} />
          <Route path="/Game2" element={<Game2 />} />
          <Route path="/Game3" element={<Game3 />} />
          <Route path="/TempMail" element={<TempMail />} />
          <Route path="/TempMailInbox" element={<TempMailInbox />} />
          <Route path="/GuerrillaMailInbox" element={<GuerrillaMailInbox />} />
          <Route path="/EmailDetail" element={<EmailDetail />} />
          <Route path="/GuerrillaEmailDetail" element={<GuerrillaEmailDetailRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AlertProvider>
  );
}
