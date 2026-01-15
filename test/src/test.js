import '../load-env.cjs';
import { createTTSClient } from 'js-tts-wrapper';
import { SpeechMarkdown } from "js-tts-wrapper";

//SpeechMarkdown.configureSpeechMarkdown({ enabled: false }); // fallback-only
SpeechMarkdown.configureSpeechMarkdown({ enabled: true });  // ensure full parser

// Create a TTS client using the factory function
const tts = createTTSClient('azure', {
  subscriptionKey: process.env.MICROSOFT_TOKEN,
  region: process.env.MICROSOFT_REGION
});

// Detailed validation - returns comprehensive status
const status = await tts.getCredentialStatus();
console.log(status);

// Use the client as normal
await tts.speak('Hello from the factory pattern!');

// Simple SpeechMarkdown example
// read text from file and speak it
import fs from 'fs';
const mdText = fs.readFileSync('examples/Simple-Speechmarkdown-Examples.smd', 'utf8');
await tts.speak(mdText, { useSpeechMarkdown: true });
//await tts.speak(mdText);

// SSML example
const ssml = `
<speak>
  <prosody rate="slow" pitch="low">
    This text will be spoken slowly with a low pitch.
  </prosody>
  <break time="500ms"/>
  <emphasis level="strong">This text is emphasized.</emphasis>
</speak>
`;

await tts.speak(ssml);
