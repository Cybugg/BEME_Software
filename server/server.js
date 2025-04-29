const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const DXFParser = require('dxf-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();


const app = express();
const PORT = 4000 || process.env.PORT;
app.use(cors());

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
  const filePath = path.join(__dirname, req.file.path);
  const parser = new DXFParser();

  try {
    const dxfData = parser.parseSync(fs.readFileSync(filePath, 'utf-8'));

    // Extract lines, polylines, blocks
    const entities = dxfData.entities;
    const components = [];

    for (const entity of entities) {
      if (entity.type === 'LINE' || entity.type === 'LWPOLYLINE') {
        components.push({
          type: entity.type,
          layer: entity.layer,
          length: entity.type === 'LINE'
            ? calculateLineLength(entity)
            : calculatePolylineLength(entity),
        });
      }
      if (entity.type === 'INSERT') {
        components.push({
          type: 'BLOCK',
          name: entity.name,
          layer: entity.layer,
          position: entity.position,
        });
      }
    }

    fs.unlinkSync(filePath); // Clean up uploaded file
    res.json({ components });
  } catch (error) {
    console.error('DXF Parse Error:', error);
    res.status(500).json({ error: 'Failed to parse DXF file' });
  }
});

function calculateLineLength(entity) {
  const { start, end } = entity;
  return Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
  );
}

function calculatePolylineLength(entity) {
  const vertices = entity.vertices || [];
  let length = 0;
  for (let i = 1; i < vertices.length; i++) {
    const dx = vertices[i].x - vertices[i - 1].x;
    const dy = vertices[i].y - vertices[i - 1].y;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length;
}

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
