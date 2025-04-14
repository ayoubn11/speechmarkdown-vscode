import { Engine } from "@aws-sdk/client-polly";
import * as vscode from "vscode";
import { JSHoverProvider } from "./hoverProvider";
import { SMLTextWriter } from "./smdOutputProvider";
import { SSMLAudioPlayer } from "./ssmlAudioPlayer";
import axios from "axios";

let jsCentralProvider = new JSHoverProvider();

export function activate(context: vscode.ExtensionContext) {

  context.subscriptions.push(
    vscode.commands.registerCommand("extension.speechmarkdownspeakasterics", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor.");
        return;
      }

      let text = editor.document.getText(editor.selection).trim();
      if (!text) {
        text = editor.document.getText(); // speak entire document
      }
      if (!text) {
        vscode.window.showErrorMessage("No text available.");
        return;
      }

      try {
        let astericsVoice = <string>vscode.workspace.getConfiguration().get("speechmarkdown.astericsVoice");
        if (!astericsVoice) {
          const { data } = await axios.get<{ voices: any[] }>("http://127.0.0.1:5555/api/voices");
          if (!data.voices?.length) {
            vscode.window.showErrorMessage("No voices available from Asterics.");
            return;
          }
          const pick = await vscode.window.showQuickPick(
            data.voices.map((v) => ({
              label: v.name,
              description: `${v.id} (${v.providerId})`,
              voiceId: v.id,
              providerId: v.providerId,
            })),
            { placeHolder: "Choose a voice for Asterics" }
          );
          if (!pick) return;
          astericsVoice = pick.providerId + "/" + pick.voiceId;
          await vscode.workspace.getConfiguration().update("speechmarkdown.astericsVoice", astericsVoice, true);
        }

        const [providerId, voiceId] = astericsVoice.split("/");
        if (!providerId || !voiceId) {
          vscode.window.showErrorMessage("Invalid Asterics voice setting.");
          return;
        }
        const url = `http://127.0.0.1:5555/api/speak/${encodeURIComponent(text)}/${providerId}/${voiceId}`;
        await axios.get(url);
        vscode.window.showInformationMessage("Asterics speech request sent.");
      } catch (err) {
        vscode.window.showErrorMessage(`Asterics speak failed: ${err}`);
      }
    })
  );

  try {
    context.subscriptions.push(
      vscode.commands.registerCommand('extension.speechmarkdownpreview', () => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
          
            let selection : string = editor.document.getText(editor.selection);
            try
            {
              SMLTextWriter.displaySSMLText(selection);
            }
            catch(ex)
            {
              console.log(ex);
            }
        }
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('extension.speechmarkdownspeakpolly', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showErrorMessage("No active editor.");
          return;
        }
        let text = editor.document.getText(editor.selection).trim();
        if (!text) {
          text = editor.document.getText();
        }
        if (!text) {
          vscode.window.showErrorMessage("No text available.");
          return;
        }
        try {
          SSMLAudioPlayer.getSSMLSpeechAsync(text, Engine.STANDARD);
        } catch (err) {
          vscode.window.showErrorMessage(`Polly speak failed: ${err}`);
        }
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('extension.speechmarkdownspeakpollyneural', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showErrorMessage("No active editor.");
          return;
        }
        let text = editor.document.getText(editor.selection).trim();
        if (!text) {
          text = editor.document.getText();
        }
        if (!text) {
          vscode.window.showErrorMessage("No text available.");
          return;
        }
        try {
          SSMLAudioPlayer.getSSMLSpeechAsync(text, Engine.NEURAL);
        } catch (err) {
          vscode.window.showErrorMessage(`Polly speak failed: ${err}`);
        }
      })
    );

    context.subscriptions.push(
      vscode.languages.registerHoverProvider("typescript", jsCentralProvider)
    );

    context.subscriptions.push(
      vscode.languages.registerHoverProvider("javascript", jsCentralProvider)
    );

    context.subscriptions.push(
      vscode.languages.registerHoverProvider("json", jsCentralProvider)
    );

    context.subscriptions.push(
      vscode.languages.registerHoverProvider("yaml", jsCentralProvider)
    );
  
    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider("json", jsCentralProvider)
    );

    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(
        "typescript",
        jsCentralProvider
      )
    );

    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(
        "javascript",
        jsCentralProvider
      )
    );

    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(
        "yaml",
        jsCentralProvider
      )
    );

  } catch(ex)
  {
     console.error(ex);
  }
}