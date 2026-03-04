import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

export default function MinhasNotas() {
  const [notas, setNotas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const buscarNotas = async () => {
      // 1. Puxa as notas que o seu backend salvou
      const q = query(collection(db, "notas_emitidas"), orderBy("dataEmissao", "desc"));
      const snap = await getDocs(q);
      setNotas(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    buscarNotas();
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Histórico de Notas</h2>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold uppercase">ID Integração</th>
              <th className="p-4 text-xs font-bold uppercase">Cliente</th>
              <th className="p-4 text-xs font-bold uppercase">Status</th>
              <th className="p-4 text-xs font-bold uppercase">Ação</th>
            </tr>
          </thead>
          <tbody>
            {notas.map(nota => (
              <tr key={nota.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-sm">{nota.id}</td>
                <td className="p-4 text-sm font-bold">{nota.dadosFormulario.razaoSocialTomador}</td>
                <td className="p-4 text-sm font-bold text-red-600">REJEITADA (E0312)</td>
                <td className="p-4">
                  {/* 2. O BOTÃO QUE ENVIA PARA A TELA DE EMISSÃO COM O ID NA URL */}
                  <button 
                    onClick={() => navigate(`/emitir-nota?reprocessar=${nota.id}`)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold"
                  >
                    Corrigir e Reenviar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}