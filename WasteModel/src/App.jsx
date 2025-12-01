import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Quiz from './pages/Quiz';
import QuickSort from './pages/QuickSort';
import ImageRecognition from './pages/ImageRecognition';
import '../src/index.css';
import './App.css';

function App({ children }) {
  return (
    <AuthProvider>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/quick-sort" element={<QuickSort />} />
          <Route path="/image-recognition" element={<ImageRecognition />} />
        </Routes>
        <Footer />
        {children || null}
      </div>
    </AuthProvider>
  );
}

export default App;
