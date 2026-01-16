# Notes & Issues

List of known issues and notes to be addressed later.

## Issue requests

* Make debug mode, showing 
  * library version
  * used tts provider including settings
  * useSpeechMarkdown flag
  * final text sent to provider

## Knowns Issues

* WitAI log output to verbose
* Programmatically enabling/disabling use of speechmarkdown not working
  * SpeechMarkdown.configureSpeechMarkdown({ enabled: true });
* Compilation errors in webrtc library due to type definition mismatch
  * Should it be ignored?
* Express-as-style sections #[excited] must have an empty line before
* Not supported Express-as-style sections e.g. #[default] instead of #[defaults] throw a parsing error.
* tests and browser demos in js-tts-wrapper/examples don't work as documented
* TTS provider options: voiceId property ignored
  * when used for azure tts provider, maybe also for others
  * setVoice works

### Log Outputs

#### Running as extension

```
console.ts:139 [Extension Host] Converting Speech Markdown to SSML for Azure.
console.ts:139 [Extension Host] oA.synthToBytes - TTS text <speak xml:lang="en-US" version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"><voice name="zh-CN-XiaoxiaoMultilingualNeural"><prosody rate="medium" pitch="medium" volume="100%">There is a short pause <break time="500ms"/>, before I continue.
I can make text ++important++ or use (very emphasised)[emphasis:'strong'] and (slightly emphasised)[emphasis:'reduced'].
(I can speak text slow)[rate:'x-slow'] and (I can speak text fast)[rate:'x-fast'].
(I can speak text high)[pitch:"high"] and (I can speak text low)[pitch:"low"].
(I can speak text loud)[volume:"loud"] and (I can speak text soft)[volume:"soft"].</prosody></voice></speak>, Options: {"useSpeechMarkdown":true,"format":"mp3"}
```

#### Running with webpack

```Converting Speech Markdown to SSML for Azure.
Azure SSML warnings: [
  "Engine 'azure' requires xmlns attribute in <speak> tag.",
  "Engine 'azure' requires version attribute in <speak> tag."
]
AzureTTSClient.synthToBytes - TTS text <speak xml:lang="en-US" version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"><voice name="zh-CN-XiaoxiaoMultilingualNeural"><prosody rate="medium" pitch="medium" volume="100%">MS Azure test
There is a short pause <break time="500ms"/>, before I continue.
I can make text <emphasis level="strong">important</emphasis> or use very emphasised and slightly emphasised.
<prosody rate="x-slow">I can speak text slow</prosody> and <prosody rate="x-fast">I can speak text fast</prosody>.
<prosody pitch="high">I can speak text high</prosody> and <prosody pitch="low">I can speak text low</prosody>.
<prosody volume="loud">I can speak text loud</prosody> and <prosody volume="soft">I can speak text soft</prosody>.</prosody></voice></speak>, Options: {"useSpeechMarkdown":true,"format":"mp3"}
```



