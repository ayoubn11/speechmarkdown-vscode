import { SpeechMarkdown } from "js-tts-wrapper";
import { loadTTSProviders } from '../load-env.cjs';

//SpeechMarkdown.configureSpeechMarkdown({ enabled: false }); // fallback-only
SpeechMarkdown.configureSpeechMarkdown({ enabled: true });  // ensure full parser

// create TTS clients
const ttsProviders = loadTTSProviders();

// Simple SpeechMarkdown example
// read text from file and speak it
import fs from 'fs';
const mdText = fs.readFileSync('examples/elevenlabs_v3-model-audiotags.smd', 'utf8');

// MS Azure TTS
console.log("\nMS Azure TTS: 0% support expected.\n");
await ttsProviders['azure'].speak("MS Azure test\n" + mdText, { useSpeechMarkdown: true });

// WitAI TTS
console.log("\nWitAI TTS: 0% support expected.\n");
await ttsProviders['witai'].speak("WitAI test\n" + mdText, { useSpeechMarkdown: true });

// ElevenLabs TTS
console.log("\nElevenLabs " + ttsProviders['elevenlabs'].modelId + ": 100% support expected.\n");
await ttsProviders['elevenlabs'].speak("ElevenLabs test\n" + mdText, { useSpeechMarkdown: true });