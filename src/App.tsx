import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Genres from './pages/Genres';
import Library from './pages/Library';
import Profile from './pages/Profile';
import WorkDetails from './pages/WorkDetails';
import Reader from './pages/Reader';
import Study from './pages/Study';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-pink-50 pb-20 font-sans">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/genres" element={<Genres />} />
            <Route path="/library" element={<Library />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/work/:id" element={<WorkDetails />} />
            <Route path="/read/:workId/:chapterId" element={<Reader />} />
            <Route path="/study" element={<Study />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
