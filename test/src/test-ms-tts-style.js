import { SpeechMarkdown } from "js-tts-wrapper";
import { loadTTSProviders } from '../load-env.cjs';

//SpeechMarkdown.configureSpeechMarkdown({ enabled: false }); // fallback-only
SpeechMarkdown.configureSpeechMarkdown({ enabled: true });  // ensure full parser

// create TTS clients
const ttsProviders = loadTTSProviders();

// Load Simple SpeechMarkdown example
import fs from 'fs';
const mdText = fs.readFileSync('examples/Express-as-Examples.smd', 'utf8');

// Speak with Azure TTS
console.log("\nMS Azure TTS: express-as styles 100% expected to work.\n");
await ttsProviders['azure'].speak("MS Azure test\n" + mdText, { useSpeechMarkdown: true });

// Speak with WitAI TTS
console.log("\nWiTAI: express-as styles partly expected to work.\n");
await ttsProviders['witai'].speak("WitAI test\n" + mdText, { useSpeechMarkdown: true });

// Speak with elevenlabs TTS
console.log("\nElevenLabs " + ttsProviders['elevenlabs'].modelId + ": express-as styles depending on used model.\n");
await ttsProviders['elevenlabs'].speak("ElevenLabs test\n" + mdText, { useSpeechMarkdown: true });