@echo off
echo Setting up n8n Workflow Generator...
npm install
npm run build
echo Setup complete! Run 'npx n8n start' to begin.
pause
