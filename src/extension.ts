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
  
      const text = editor.document.getText(editor.selection).trim();
      if (!text) {
        vscode.window.showErrorMessage("No text selected.");
        return;
      }
  
      try {
        const { data } = await axios.get<{ voices: any[] }>("http://127.0.0.1:5555/api/voices");
        const voices = data.voices;
  
        if (!voices?.length) {
          vscode.window.showErrorMessage("No voices available from Asterics.");
          return;
        }
  
        const pick = await vscode.window.showQuickPick(
          voices.map((v) => ({
            label: v.name,
            description: `${v.id} (${v.providerId})`,
            voiceId: v.id,
            providerId: v.providerId,
          })),
          { placeHolder: "Choose a voice for Asterics" }
        );
  
        if (!pick) return;
  
        const url = `http://127.0.0.1:5555/api/speak/${encodeURIComponent(text)}/${pick.providerId}/${pick.voiceId}`;
        await axios.get(url);
  
        vscode.window.showInformationMessage(`🗣️ Sent to Asterics: ${pick.label}`);
      } catch (err) {
        vscode.window.showErrorMessage(`Asterics speak failed: ${err}`);
      }
    })
  );
  

  try
  {
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
      vscode.commands.registerCommand('extension.speechmarkdownspeakpolly', () => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
          
            let selection : string = editor.document.getText(editor.selection);
            
            SSMLAudioPlayer.getSSMLSpeechAsync(selection, Engine.STANDARD);
        }
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('extension.speechmarkdownspeakpollyneural', () => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
          
            let selection : string = editor.document.getText(editor.selection);
            
            SSMLAudioPlayer.getSSMLSpeechAsync(selection, Engine.NEURAL);
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