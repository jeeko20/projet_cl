const fs = require('fs');
const path = require('path');

function extractBase64FromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/"wav_base64":\s*"([^"]+)"/);
  if (match) {
    return match[1];
  }
  return null;
}

function decodeAndSave(sessionDir, outputFile, audioDuration) {
  const pattern = `${sessionDir}/mcp__voicestudio__generate_speech-*.txt`;
  const files = fs.readdirSync(sessionDir).filter(f => f.startsWith('mcp__voicestudio__generate_speech') && f.endsWith('.txt'));
  
  for (const file of files) {
    const base64 = extractBase64FromFile(path.join(sessionDir, file));
    if (base64 && base64.length > 1000) {
      const buffer = Buffer.from(base64, 'base64');
      fs.writeFileSync(outputFile, buffer);
      console.log(`Saved ${outputFile} (${buffer.length} bytes)`);
      return true;
    }
  }
  return false;
}

const sessionDir = process.argv[2];
const outputFile = process.argv[3];

if (!sessionDir || !outputFile) {
  console.log('Usage: node save-audio.js <session_dir> <output_file>');
  process.exit(1);
}

const success = decodeAndSave(sessionDir, outputFile);
if (!success) {
  console.error('Could not find audio data');
  process.exit(1);
}