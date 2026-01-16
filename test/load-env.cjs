// This script loads environment variables from a .env file
const { VoiceId } = require("@aws-sdk/client-polly");
const fs = require("fs");
const { createTTSClient } = require("js-tts-wrapper");
const path = require("path");

// Read the .env file from the project root
const envFile = path.join(__dirname, "..", ".env");
if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, "utf8");

  // Parse the environment variables
  const envLines = envContent.split("\n");
  for (const line of envLines) {
    if (line.trim() && !line.startsWith("#")) {
      console.log("Processing line:", line);
      const match = line.match(/^export\s+([A-Za-z0-9_]+)="(.*)"/);
      if (match) {
        const [, key, value] = match;
        process.env[key] = value;
        console.log(`Set environment variable: ${key}`);
      } else {
        console.log("No match for line");
      }
    }
  }

  console.log("Environment variables loaded from .env file");
} else {
  console.log("No .env file found");
}

function loadEnv() {
  // This function can be called to load environment variables
  // The actual loading happens when this module is required
}

function loadTTSProviders() {
  // This function can be used to load TTS providers if needed
  let ttsProviders = {};

  ttsProviders['witai'] = createTTSClient('witai', {
    token: process.env.WITAI_TOKEN
  });
  ttsProviders['witai'].setVoice(process.env.WITAI_VOICE || 'wit$Rebecca');

  ttsProviders['witai'].getCredentialStatus().then(status => {
    //console.log("Wit.ai credential status:", status);
    if (!status.valid) {
      console.error("Wit.ai credentials are not valid");
    }
  });

  ttsProviders['azure'] = createTTSClient('azure', {
    subscriptionKey: process.env.MICROSOFT_TOKEN,
    region: process.env.MICROSOFT_REGION,
    voiceId: process.env.MICROSOFT_VOICE || 'en-US-AriaNeural'
  });
  ttsProviders['azure'].setVoice(process.env.MICROSOFT_VOICE || 'en-US-AriaNeural');

  // Detailed validation - returns comprehensive status
  ttsProviders['azure'].getCredentialStatus().then(status => {
    //console.log("Azure credential status:", status);
    if (!status.valid) {
      console.error("Azure credentials are not valid");
    }
  });
  ttsProviders['polly'] = createTTSClient('polly', {
    accessKeyId: process.env.POLLY_AWS_KEY_ID,
    secretAccessKey: process.env.POLLY_AWS_ACCESS_KEY,
    region: process.env.AWS_REGION
  });
  process.env.POLLY_VOICE ? ttsProviders['polly'].setVoice(process.env.POLLY_VOICE) : null;

  // Detailed validation - returns comprehensive status
  ttsProviders['polly'].getCredentialStatus().then(status => {
    //console.log("Polly credential status:", status);
    if (!status.valid) {
      console.error("Polly credentials are not valid");
    }
  });

  ttsProviders['elevenlabs'] = createTTSClient('elevenlabs', {
    apiKey: process.env.ELEVENLABS_API_KEY,
    properties: {
      model: process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2'
    }
  });
  ttsProviders['elevenlabs'].setVoice(process.env.ELEVENLABS_VOICE || 'cgSgspJ2msm6clMCkdW9');

  ttsProviders['elevenlabs'].getCredentialStatus().then(status => {
    //console.log("ElevenLabs credential status:", status);
    if (!status.valid) {
      console.error("ElevenLabs credentials are not valid");
    }
  });
  return ttsProviders;
}

module.exports = { loadEnv, loadTTSProviders };
