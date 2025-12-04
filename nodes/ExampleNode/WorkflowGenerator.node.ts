import type { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';
// Import the official Google AI Library
import { GoogleGenerativeAI } from '@google/generative-ai';

// Use require for Node.js modules to avoid TypeScript issues
const fs = require('fs');
const path = require('path');

export class WorkflowGenerator implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Workflow Generator (AI)',
        name: 'workflowGeneratorAi',
        icon: 'fa:magic',
        group: ['transform'],
        version: 1,
        description: 'Generates an n8n workflow from a text prompt using an LLM.',
        defaults: {
            name: 'Workflow Generator (AI)',
        },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        properties: [
            {
                displayName: 'Describe the workflow you want to build',
                name: 'prompt',
                type: 'string',
                default: '',
                placeholder: 'e.g., When a webhook is called, send "Hello World" to Slack.',
                required: true,
                typeOptions: {
                    rows: 5,
                },
            },
        ],
    };

   async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const userPrompt = this.getNodeParameter('prompt', 0, '') as string;
        
        const GEMINI_API_KEY = 'AIzaSyCv99ZcsbycTKu8QfCfhuFT4XX2Z2lyqTA'; 

        const masterPrompt = `
        You are an expert n8n workflow generator. Your task is to convert the user's plain text request into a valid n8n workflow JSON object.
        The final output MUST be ONLY the JSON object, with no other text, comments, or markdown "json" tags before or after it.
        The JSON must have two top-level keys: "nodes" and "connections".
        Always start the workflow with a trigger node, like "n8n-nodes-base.manualTrigger" or "n8n-nodes-base.webhook".
        Do not try to guess credentials; leave the "credentials" block empty.
        EXAMPLE:
        USER PROMPT: "Create a workflow that sends 'hello world' to the 'general' channel in Slack when I start it manually."
        YOUR JSON OUTPUT:
        {
        "nodes": [
            { "parameters": {}, "id": "f0ed5a53-5523-41a4-9961-a47ad43e26a3", "name": "Start", "type": "n8n-nodes-base.manualTrigger", "typeVersion": 1, "position": [820, 300] },
            { "parameters": { "channel": "general", "text": "hello world" }, "id": "e6f49129-844c-4a11-9a29-07f0f622919d", "name": "Slack", "type": "n8n-nodes-base.slack", "typeVersion": 2, "position": [1040, 300], "credentials": {} }
        ],
        "connections": {
            "Start": { "main": [ [ { "node": "Slack", "type": "main", "index": 0 } ] ] }
        }
        }
        --- END OF EXAMPLES ---
        Now, generate the JSON for the following user request.
        USER PROMPT: "${userPrompt}"
        YOUR JSON OUTPUT:
        `;

        try {
            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY); 
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent(masterPrompt);
            const response = result.response;
            let generatedText = response.text();

            // Clean up the response
            generatedText = generatedText.replace(/```json/g, '').replace(/```/g, '').trim();
            const generatedJson: any = JSON.parse(generatedText);

            // Automatically save the workflow to a file
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `n8n-workflow-${timestamp}.json`;
            
            // Auto-save to your specified directory
            const outputDir = 'D:\\n8n_gdgc_project\\generated-workflows';
            const fullFilePath = path.join(outputDir, fileName);

            let fileSaved = false;
            let saveMessage = '';

            try {
                // Ensure directory exists
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                    console.log(`Created directory: ${outputDir}`);
                }
                
                // Save the clean workflow JSON (ready for n8n import)
                fs.writeFileSync(fullFilePath, JSON.stringify(generatedJson, null, 2));
                fileSaved = true;
                saveMessage = `✅ Workflow successfully saved to: ${fullFilePath}`;
                this.logger.info(saveMessage);
                console.log(saveMessage);
            } catch (fileError) {
                saveMessage = `❌ Failed to save workflow file: ${fileError.message}`;
                this.logger.warn(saveMessage);
                console.error(saveMessage);
            }

            const executionData: INodeExecutionData[] = [
                {
                    json: {
                        "n8n-autopaste": generatedJson,
                        "workflow": generatedJson,
                        "fileSaved": fileSaved,
                        "savedToPath": fullFilePath,
                        "fileName": fileName,
                        "saveMessage": saveMessage,
                        "directory": outputDir,
                        "instructions": fileSaved ? 
                            `File saved successfully! You can import it from: ${fullFilePath}` :
                            "File save failed. Check the console for error details.",
                        "originalPrompt": userPrompt,
                    },
                },
            ];
            return [executionData];

        } catch (error) {
            this.logger.error('Gemini API Error:', error);
            
            if (error.message && error.message.includes('models/')) {
                throw new Error(`Model not available. Try using 'gemini-1.5-flash' or 'gemini-1.5-pro'. Error: ${error.message}`);
            } else if (error.message && error.message.includes('API key')) {
                throw new Error(`Invalid API key. Please check your Gemini API key. Error: ${error.message}`);
            } else if (error instanceof SyntaxError) {
                throw new Error(`Failed to parse AI response as JSON. The AI might have returned invalid JSON. Error: ${error.message}`);
            } else {
                throw new Error(`Failed to generate workflow. Error: ${error.message}`);
            }
        }
    }
}
