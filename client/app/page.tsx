'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();
    setData(result.components);
  };

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">DXF HVAC BEME Extractor</h1>
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button
        className="bg-blue-500 text-white p-2 rounded mt-2"
        onClick={handleUpload}
      >
        Upload & Extract
      </button>

      {data.length > 0 && (
        <table className="mt-6 border w-full">
          <thead>
            <tr>
              <th className="border p-2">Type</th>
              <th className="border p-2">Layer</th>
              <th className="border p-2">Length</th>
              <th className="border p-2">Block Name</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i}>
                <td className="border p-2">{item.type}</td>
                <td className="border p-2">{item.layer}</td>
                <td className="border p-2">{item.length?.toFixed(2)}</td>
                <td className="border p-2">{item.block}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
