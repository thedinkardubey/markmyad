// Test script to verify Gemini API is working with correct model
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBsQwihvVpdnFcaHgvnP-G2fJbeTzuASSI';

async function testGeminiWithRBACCommand() {
  console.log('🧪 Testing Gemini API with RBAC command parsing...\n');

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const testCommands = [
      'assign reader the permission can_read_articles',
      'make a new role called premium_user',
      'create a role called moderator and create role guest'
    ];

    for (const command of testCommands) {
      console.log(`\n📤 Testing command: "${command}"`);
      
      const prompt = `
You are an AI assistant specialized in parsing Role-Based Access Control (RBAC) commands.
Parse the following natural language command and extract the intent and entities.

Command: "${command}"

Respond ONLY with a valid JSON object in this exact format:
{
  "action": "create_permission" | "create_role" | "assign_permission" | "remove_permission" | "list_roles" | "list_permissions" | "describe_role" | "unknown",
  "entities": {
    "roleName": "extracted role name or null",
    "permissionName": "extracted permission name or null",
    "description": "extracted description or null"
  },
  "confidence": 0.0 to 1.0,
  "suggestions": ["alternative interpretation 1", "alternative interpretation 2"]
}

Now parse the command above and respond with JSON only.
`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('✅ Gemini Response:');
      console.log(text);
      console.log('---');
    }

    console.log('\n✅ SUCCESS: Gemini API is working perfectly!');
    console.log('🎉 Use model "gemini-2.5-flash" in your code');
    
    return true;
  } catch (error: any) {
    console.error('\n❌ ERROR:', error.message);
    return false;
  }
}

testGeminiWithRBACCommand();
