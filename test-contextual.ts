import { geminiService } from './lib/gemini.service';

async function testContextualUnderstanding() {
  console.log('🧪 Testing Contextual Understanding\n');
  
  const testCommand = 'give permission to content editor to view dashboard';
  console.log(`Command: "${testCommand}"\n`);
  
  try {
    const result = await geminiService.parseCommand(testCommand);
    
    console.log('📊 Parse Result:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');
    
    // Check if it correctly mapped to the actual entities
    const success = 
      result.action === 'assign_permission' &&
      (result.entities.roleName === 'content_editor' || result.entities.roleName?.includes('editor')) &&
      (result.entities.permissionName === 'can_view_dashboard' || result.entities.permissionName?.includes('dashboard')) &&
      result.confidence >= 0.8;
    
    if (success) {
      console.log('✅ SUCCESS: Gemini correctly understood the contextual mapping!');
      console.log(`   - Role: ${result.entities.roleName}`);
      console.log(`   - Permission: ${result.entities.permissionName}`);
      console.log(`   - Confidence: ${result.confidence}`);
    } else {
      console.log('❌ FAILED: Gemini did not map correctly');
      console.log(`   Expected: assign_permission with content_editor and can_view_dashboard`);
      console.log(`   Got: ${result.action} with ${result.entities.roleName} and ${result.entities.permissionName}`);
    }
    
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testContextualUnderstanding();
