import { SpeechMarkdown } from "js-tts-wrapper";
import { loadTTSProviders } from '../load-env.cjs';

//SpeechMarkdown.configureSpeechMarkdown({ enabled: false }); // fallback-only
SpeechMarkdown.configureSpeechMarkdown({ enabled: true });  // ensure full parser

// create TTS clients
const ttsProviders = loadTTSProviders();

//console.log(ttsProviders);
console.log("\n\nWitAI TTS Provider Configuration:\n");
console.log(ttsProviders['azure'].voiceId);