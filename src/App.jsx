import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; // Importando a nossa moldura
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; // Vamos mover aquele Dashboard para pages
import CadastroClientes from './pages/CadastroClientes';
import CadastroProdutos from './pages/CadastroProdutos';
import EmitirNota from './pages/EmitirNota';
import MinhasNotas from './pages/MinhasNotas';
import Configuracoes from './pages/Configuracoes';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública (Sem o menu lateral) */}
        <Route path="/" element={<Login />} />
        
        {/* Rotas Privadas (Protegidas pelo Layout com Menu) */}
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/clientes" element={<CadastroClientes />} />
              <Route path="/produtos" element={<CadastroProdutos />} />
              <Route path="/emitir-nota" element={<EmitirNota />} />
              <Route path="/minhas-notas" element={<MinhasNotas />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}