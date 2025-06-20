import { Engine } from "@aws-sdk/client-polly";
import * as vscode from "vscode";
import { JSHoverProvider } from "./hoverProvider";
import { SMLTextWriter } from "./smdOutputProvider";
import { SSMLAudioPlayer } from "./ssmlAudioPlayer";
import { createTTSClient, type TTSClient } from "js-tts-wrapper";

import * as fs from "fs";
import * as os from "os";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  const jsCentralProvider = new JSHoverProvider();

  context.subscriptions.push(
    vscode.commands.registerCommand("speechmarkdown.speakText", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const text = editor.document.getText(editor.selection) || editor.document.getText();
      if (!text) {
        vscode.window.showErrorMessage("Document is empty.");
        return;
      }
      await speakWithTTS(text);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.speechmarkdownpreview", () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const sel = editor.document.getText(editor.selection);
      try {
        SMLTextWriter.displaySSMLText(sel);
      } catch (ex) {
        console.error(ex);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.speechmarkdownspeakpolly", () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      SSMLAudioPlayer.getSSMLSpeechAsync(editor.document.getText(editor.selection), Engine.STANDARD);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.speechmarkdownspeakpollyneural", () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      SSMLAudioPlayer.getSSMLSpeechAsync(editor.document.getText(editor.selection), Engine.NEURAL);
    })
  );

  ["typescript", "javascript", "json", "yaml"].forEach(lang => {
    context.subscriptions.push(vscode.languages.registerHoverProvider(lang, jsCentralProvider));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(lang, jsCentralProvider));
  });

 const speakBtn = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
speakBtn.text = '$(unmute) Speak Text';  
speakBtn.command = "speechmarkdown.speakText";
speakBtn.tooltip = "Speak selected text or entire document (Ctrl+Shift+S)";
speakBtn.show();
context.subscriptions.push(speakBtn);



  function getTimestamp(): string {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
  }

  async function speakWithTTS(text: string) {
    const config = vscode.workspace.getConfiguration("speechmarkdown");
    const provider = config.get<string>("defaultProvider") || "Amazon Polly";
    const client = await createClientFromConfig(provider, config);
    if (!client) return;

    try {
      const editor = vscode.window.activeTextEditor;
      const baseName = editor && editor.document.uri.fsPath
        ? path.basename(editor.document.uri.fsPath, path.extname(editor.document.uri.fsPath))
        : "untitled";

      const fileName = `${provider.replace(/\s+/g, "")}_${baseName}_${getTimestamp()}.mp3`;
      const outDir = config.get<string>("outputDir")?.trim()
        || path.join(os.homedir(), "tts-output");
      fs.mkdirSync(outDir, { recursive: true });

      const fullPath = path.join(outDir, fileName);

      await client.synthToFile(text, fullPath, { format: "mp3" });

      vscode.window.showInformationMessage(`Saved audio: ${fullPath}`);

      await client.speak(text);
    } catch (err: any) {
      vscode.window.showErrorMessage(`TTS/Playback Error: ${err.message}`);
      console.error(err);
    }
  }

  async function createClientFromConfig(provider: string, config: vscode.WorkspaceConfiguration): Promise<TTSClient | null> {
    try {
      const options: any = {};
      switch (provider) {
        case "Amazon Polly":
          options.accessKeyId = config.get<string>("aws.accessKeyId");
          options.secretAccessKey = config.get<string>("aws.secretAccessKey");
          options.region = config.get<string>("aws.region") || "us-east-1";
          if (!options.accessKeyId || !options.secretAccessKey) {
            vscode.window.showErrorMessage("Missing AWS credentials.");
            return null;
          }
          break;
        case "ElevenLabs":
          options.apiKey = config.get<string>("elevenLabs.apiKey");
          if (!options.apiKey) {
            vscode.window.showErrorMessage("Missing ElevenLabs API key.");
            return null;
          }
          break;
        case "OpenAI":
          options.apiKey = config.get<string>("openai.apiKey");
          options.model = config.get<string>("openai.model") || "gpt-4o-mini-tts";
          if (!options.apiKey) {
            vscode.window.showErrorMessage("Missing OpenAI API key.");
            return null;
          }
          break;
        case "Azure":
          options.subscriptionKey = config.get<string>("azure.subscriptionKey");
          options.region = config.get<string>("azure.region") || "eastus";
          if (!options.subscriptionKey) {
            vscode.window.showErrorMessage("Missing Azure subscription key.");
            return null;
          }
          break;
        case "SherpaOnnx":
          options.modelPath = config.get<string>("sherpa.modelPath");
          options.token = config.get<string>("sherpa.token");
          if (!options.modelPath || !options.token) {
            vscode.window.showErrorMessage("Missing SherpaONNX config.");
            return null;
          }
          break;
        case "Google":
          options.keyFile = config.get<string>("google.keyFilePath");
          if (!options.keyFile) {
            vscode.window.showErrorMessage("Missing Google key file path.");
            return null;
          }
          break;
        default:
          vscode.window.showErrorMessage("Invalid TTS provider.");
          return null;
      }

      const client = createTTSClient(provider, options);
      const res = await client.checkCredentialsDetailed();
      if (!res.success) {
        vscode.window.showErrorMessage(`${provider} Error: ${res.error}`);
        return null;
      }

      const defaultVoice = config.get<string>("defaultVoice");
      if (defaultVoice) {
        client.setVoice?.(defaultVoice);
      } else {
        const voices = await client.getVoices?.();
        if (voices && voices.length > 0) {
          const first = voices[0] as any;
          client.setVoice?.(first.id || first.name);
        }
      }

      return client;
    } catch (err: any) {
      vscode.window.showErrorMessage(`TTS init failed: ${err.message}`);
      return null;
    }
  }
}
