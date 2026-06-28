import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Definimos un tipo para asegurar que los datos sean correctos
interface Trabajo {
  unidad: string;
  [key: string]: any;
}

export default function Analytics({ trabajos }: { trabajos: Trabajo[] }) {
  const dataMap: Record<string, number> = { 
    'UNIDAD I': 0, 'UNIDAD II': 0, 'UNIDAD III': 0, 'UNIDAD IV': 0 
  };

  trabajos.forEach((t) => {
    if (dataMap.hasOwnProperty(t.unidad)) {
      dataMap[t.unidad] += 1;
    }
  });

  const data = Object.keys(dataMap).map(key => ({
    name: key,
    Entregas: dataMap[key]
  }));

  return (
    <div className="bg-[#0a142c] p-6 rounded-[2rem] border border-white/5 shadow-xl w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip contentStyle={{ backgroundColor: '#050A18', border: 'none' }} />
          <Bar dataKey="Entregas" fill="#00B4D8" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}