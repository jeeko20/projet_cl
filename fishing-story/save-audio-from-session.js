const fs = require('fs');
const path = require('path');

const sessionDir = '/home/codespace/.kimi-code/sessions/wd_projet_cl_34c4a4a3fac5/session_2cd22f91-1219-45d0-8471-b2dcd6ed7e74/agents/main/tool-results';

function findLatestAudioFile() {
  const files = fs.readdirSync(sessionDir)
    .filter(f => f.startsWith('mcp__voicestudio__generate_speech') && f.endsWith('.txt'))
    .sort()
    .reverse();
  return files[0];
}

function extractBase64(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/"wav_base64":\s*"([^"]+)"/);
  return match ? match[1] : null;
}

const latestFile = findLatestAudioFile();
if (!latestFile) {
  console.error('No audio file found');
  process.exit(1);
}

const filePath = path.join(sessionDir, latestFile);
const base64 = extractBase64(filePath);

if (!base64) {
  console.error('No base64 data found in file');
  process.exit(1);
}

// Check the size of the base64 data
console.log(`Base64 data length: ${base64.length}`);

// Decode and save
const buffer = Buffer.from(base64, 'base64');
console.log(`Decoded buffer length: ${buffer.length} bytes`);

// Save to a test file
const testPath = path.join(__dirname, 'public', 'audio', 'test.wav');
fs.writeFileSync(testPath, buffer);
console.log(`Saved test audio to: ${testPath}`);

// Get duration info from the file content
const durationMatch = content.match(/"audio_duration_s":\s*([0-9.]+)/);
if (durationMatch) {
  console.log(`Audio duration: ${durationMatch[1]}s`);
}
