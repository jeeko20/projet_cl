const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Voice Studio API configuration
const HOST = '127.0.0.1';
const PORT = 80;

const scenes = [
  {
    id: 1,
    text: "Early morning mist hovers over the calm lake. A weathered fishing boat sits peacefully at the dock, waiting for the day's adventure.",
    file: "scene-01-dock.wav"
  },
  {
    id: 2,
    text: "Old Thomas, a kind fisherman with silver hair and a warm smile, carefully baits his hook with a wiggling worm. His experienced hands move with practiced ease.",
    file: "scene-02-bait.wav"
  },
  {
    id: 3,
    text: "The fishing line soars through the air and lands with a soft plop in the crystal-clear water. Thomas settles into patient silence, watching the bobber dance on gentle waves.",
    file: "scene-03-cast.wav"
  },
  {
    id: 4,
    text: "Hours pass like meditation. The sun climbs higher, painting the water with diamonds of light. A dragonfly hovers nearby, curious about this patient guardian of the lake.",
    file: "scene-04-waiting.wav"
  },
  {
    id: 5,
    text: "Suddenly, the bobber plunges beneath the surface! Thomas's eyes widen with excitement as he grabs his rod. The battle begins — a powerful fish fights for freedom!",
    file: "scene-05-catch.wav"
  },
  {
    id: 6,
    text: "After an epic struggle, a beautiful silver bass glitters in the sunlight. Thomas smiles, admiring his catch before gently releasing it back to freedom. The lake returns to peace, and so does his heart.",
    file: "scene-06-release.wav"
  }
];

function generateSpeech(text) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      text: text,
      format: "wav",
      steps: 16,
      speed: 1.0,
      language: "Auto"
    });

    const options = {
      hostname: HOST,
      port: PORT,
      path: '/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.wav_base64) {
            resolve(result);
          } else {
            reject(new Error('No audio in response'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  const outputDir = path.join(__dirname, 'public', 'audio');
  
  for (const scene of scenes) {
    console.log(`Generating audio for scene ${scene.id}: ${scene.file}`);
    try {
      const result = await generateSpeech(scene.text);
      const wavBuffer = Buffer.from(result.wav_base64, 'base64');
      const outputPath = path.join(outputDir, scene.file);
      fs.writeFileSync(outputPath, wavBuffer);
      console.log(`Saved: ${outputPath} (${result.audio_duration_s?.toFixed(2)}s)`);
    } catch (e) {
      console.error(`Error for scene ${scene.id}:`, e.message);
    }
  }
  console.log('Done!');
}

main().catch(console.error);