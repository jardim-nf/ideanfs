import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import CadastroClientes from './pages/CadastroClientes';
import CadastroProdutos from './pages/CadastroProdutos';
import EmitirNota from './pages/EmitirNota';

// Um Dashboard rápido para ser o nosso Menu Principal
function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Menu Principal</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button onClick={() => navigate('/clientes')} className="bg-white p-8 rounded-xl shadow border border-gray-200 hover:border-blue-500 font-bold text-lg">👥 Clientes</button>
          <button onClick={() => navigate('/produtos')} className="bg-white p-8 rounded-xl shadow border border-gray-200 hover:border-blue-500 font-bold text-lg">📦 Produtos/Serviços</button>
          <button onClick={() => navigate('/emitir-nota')} className="bg-white p-8 rounded-xl shadow border border-green-200 hover:border-green-500 font-bold text-lg text-green-700">📄 Emitir Nota</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clientes" element={<CadastroClientes />} />
        <Route path="/produtos" element={<CadastroProdutos />} />
        <Route path="/emitir-nota" element={<EmitirNota />} />
      </Routes>
    </BrowserRouter>
  );
}