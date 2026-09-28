const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

// Unzip docx using node
const docxPath = path.join(__dirname, '../PROTOHACK_SYNERGY_UPDATED_TIMELINE.docx');

// Simple zip parser
function readZip(filePath) {
  const buf = fs.readFileSync(filePath);
  let offset = 0;
  while (offset < buf.length - 4) {
    if (buf.readUInt32LE(offset) === 0x04034b50) { // Local file header signature
      const nameLen = buf.readUInt16LE(offset + 26);
      const extraLen = buf.readUInt16LE(offset + 28);
      const compMethod = buf.readUInt16LE(offset + 8);
      const compSize = buf.readUInt32LE(offset + 18);
      const fileName = buf.toString('utf8', offset + 30, offset + 30 + nameLen);
      const dataOffset = offset + 30 + nameLen + extraLen;
      
      if (fileName === 'word/document.xml') {
        const compressedData = buf.subarray(dataOffset, dataOffset + compSize);
        let xml;
        if (compMethod === 8) {
          xml = zlib.inflateRawSync(compressedData).toString('utf8');
        } else {
          xml = compressedData.toString('utf8');
        }
        
        // Extract paragraph texts
        const textMatches = xml.match(/<w:p[\s>].*?<\/w:p>/g) || [];
        const paragraphs = textMatches.map(p => {
          const tMatches = p.match(/<w:t[\s>].*?<\/w:t>/g) || [];
          return tMatches.map(t => t.replace(/<[^>]+>/g, '')).join('');
        }).filter(Boolean);
        
        console.log(paragraphs.join('\n'));
        return;
      }
      offset = dataOffset + compSize;
    } else {
      offset++;
    }
  }
}

readZip(docxPath);
