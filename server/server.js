const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const DxfParser = require('dxf-parser');

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
  const parser = new DxfParser();
  const filePath = req.file.path;

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const dxf = parser.parseSync(data);
    const entities = dxf.entities;
    const results = entities
    .filter(e => ['LINE', 'LWPOLYLINE', 'INSERT'].includes(e.type))
    .map(e => ({
      type: e.type,
      layer: e.layer,
      length: e.type === 'LINE' ? getLineLength(e) : undefined,
      block: e.type === 'INSERT' ? e.name : null
    }));
  
    res.json({ components: results });
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse DXF file' });
  }
});

function getLineLength(entity) {
  const dx = entity.vertices[1].x - entity.vertices[0].x;
  const dy = entity.vertices[1].y - entity.vertices[0].y;
  return Math.sqrt(dx * dx + dy * dy);
}

app.listen(5000, () => console.log('Backend running on http://localhost:5000'));
