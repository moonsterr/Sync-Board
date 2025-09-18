import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CanvasInstance from './pages/CanvasInstance';
import LandingPage from './pages/LandingPage';
import RegistrationPage from './pages/RegistrationPage';
import SignUpPage from './pages/SignUpPage';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/canvas" element={<CanvasInstance />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="signin" element={<RegistrationPage />} />
        <Route path="create" element={<SignUpPage />} />
      </Routes>
    </BrowserRouter>
  );
}
