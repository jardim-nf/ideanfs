import { useNavigate } from 'react-router-dom';

export default function CadastroClientes() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow border p-8">
        <button onClick={() => navigate('/dashboard')} className="text-blue-600 font-bold mb-6">← Voltar</button>
        
        <h2 className="text-2xl font-bold mb-6">Novo Cliente</h2>
        
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">CPF / CNPJ</label>
              <input type="text" className="w-full p-2 border rounded" placeholder="000.000.000-00" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Razão Social / Nome Completo</label>
              <input type="text" className="w-full p-2 border rounded" placeholder="Nome da empresa" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">E-mail Financeiro</label>
              <input type="email" className="w-full p-2 border rounded" placeholder="email@cliente.com" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Inscrição Municipal</label>
              <input type="text" className="w-full p-2 border rounded" placeholder="Opcional" />
            </div>
          </div>

          <hr />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-bold mb-1">CEP</label>
              <input type="text" className="w-full p-2 border rounded" placeholder="00000-000" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-1">Logradouro</label>
              <input type="text" className="w-full p-2 border rounded" />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm font-bold mb-1">Número</label>
              <input type="text" className="w-full p-2 border rounded" />
            </div>
          </div>

          <button type="button" onClick={() => alert('Em breve conectaremos com o Firebase Firestore!')} className="bg-blue-600 text-white font-bold py-3 px-8 rounded mt-4">
            Salvar Cliente
          </button>
        </form>
      </div>
    </div>
  );
}