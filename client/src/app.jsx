import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CanvasInstance from './pages/CanvasInstance';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/canvas" element={<CanvasInstance />} />
      </Routes>
    </BrowserRouter>
  );
}
