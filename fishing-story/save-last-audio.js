const fs = require('fs');
const path = require('path');

const sessionDir = process.env.SESSION_DIR || '/home/codespace/.kimi-code/sessions/wd_projet_cl_34c4a4a3fac5/session_2cd22f91-1219-45d0-8471-b2dcd6ed7e74/agents/main/tool-results';
const outputDir = path.join(process.cwd(), 'public', 'audio');

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

function saveAudioFromSession(outputFile) {
  const latestFile = findLatestAudioFile();
  if (!latestFile) {
    console.error('No audio file found');
    return false;
  }

  const filePath = path.join(sessionDir, latestFile);
  const base64 = extractBase64(filePath);

  if (!base64) {
    console.error('No base64 data found in file');
    return false;
  }

  const buffer = Buffer.from(base64, 'base64');
  fs.writeFileSync(outputFile, buffer);
  console.log(`Saved audio to: ${outputFile} (${buffer.length} bytes)`);
  return true;
}

// Export for use in other scripts
module.exports = { saveAudioFromSession };

// If run directly
if (require.main === module) {
  const outputFile = process.argv[2];
  if (!outputFile) {
    console.log('Usage: node save-last-audio.js <output_file>');
    console.log('Saves the most recent audio generation to the specified file.');
    process.exit(1);
  }
  
  const success = saveAudioFromSession(outputFile);
  process.exit(success ? 0 : 1);
}