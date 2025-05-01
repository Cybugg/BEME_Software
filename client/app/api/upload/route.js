export async function POST(req) {
    const formData = await req.formData();
    const file = formData.get('file');
  
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), {
        status: 400,
      });
    }
  
    const buffer = Buffer.from(await file.arrayBuffer());
  
    const res = await fetch('http://localhost:4000/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: buffer,
    });
  
    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  }
  