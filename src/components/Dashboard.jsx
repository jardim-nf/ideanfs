export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-idea-dark">Visão Geral</h1>
        <p className="text-gray-500">Acompanhe as emissões de hoje.</p>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-green-100 text-green-600 rounded-lg flex items-center justify-center text-2xl">
            ✅
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Notas Autorizadas</p>
            <h2 className="text-3xl font-bold text-idea-dark">124</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-idea-light text-idea-accent rounded-lg flex items-center justify-center text-2xl">
            💰
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Faturamento (Mês)</p>
            <h2 className="text-3xl font-bold text-idea-dark">R$ 15.430</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-lg flex items-center justify-center text-2xl">
            ⚠️
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Erros / Rejeitadas</p>
            <h2 className="text-3xl font-bold text-idea-dark">2</h2>
          </div>
        </div>

      </div>
    </div>
  );
}