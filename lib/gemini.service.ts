import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from './prisma';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface CommandIntent {
  action: 'create_permission' | 'create_role' | 'assign_permission' | 'remove_permission' | 
          'list_roles' | 'list_permissions' | 'describe_role' | 'unknown';
  entities: {
    roleName?: string;
    permissionName?: string;
    description?: string;
  };
  confidence: number;
  suggestions?: string[];
}

export interface MultiCommandResult {
  isMultiCommand: boolean;
  commands: string[];
}

export class GeminiService {
  private model;

  constructor() {
    // ✅ FIXED: Using correct model name 'gemini-2.5-flash' instead of deprecated 'gemini-pro'
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  // 🆕 Fetch existing roles and permissions for context
  private async getContextData() {
    try {
      const [roles, permissions] = await Promise.all([
        prisma.role.findMany({ select: { name: true } }),
        prisma.permission.findMany({ select: { name: true, description: true } })
      ]);
      
      return {
        roleNames: roles.map(r => r.name),
        permissions: permissions.map(p => ({ name: p.name, description: p.description || '' }))
      };
    } catch (error) {
      console.error('Error fetching context data:', error);
      return { roleNames: [], permissions: [] };
    }
  }

  // Detect if command contains multiple instructions
  async detectMultipleCommands(command: string): Promise<MultiCommandResult> {
    // Quick check for obvious separators
    const separators = [' and ', ' then ', ', ', ' also '];
    const hasSeparators = separators.some(sep => command.toLowerCase().includes(sep));
    
    if (!hasSeparators && !command.includes('  ')) {
      return { isMultiCommand: false, commands: [command] };
    }

    const prompt = `
Analyze this command and determine if it contains multiple RBAC operations:

Command: "${command}"

If it contains multiple distinct operations (like creating multiple things or doing multiple actions), split them into separate commands.
Respond ONLY with a JSON object:

{
  "isMultiCommand": true/false,
  "commands": ["command 1", "command 2", ...]
}

Examples:
- "create a role called moderator" → { "isMultiCommand": false, "commands": ["create a role called moderator"] }
- "create a role called moderator and create role guest" → { "isMultiCommand": true, "commands": ["create a role called moderator", "create role guest"] }
- "first create permission view_dashboard then assign it to admin" → { "isMultiCommand": true, "commands": ["create permission view_dashboard", "assign admin the permission view_dashboard"] }

Now analyze the command above.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      let jsonText = text;
      if (text.includes('```json')) {
        jsonText = text.split('```json')[1].split('```')[0].trim();
      } else if (text.includes('```')) {
        jsonText = text.split('```')[1].split('```')[0].trim();
      }

      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Error detecting multiple commands:', error);
      
      // Fallback: Simple split by common separators
      const commandParts = command
        .split(/\s+(?:and|then|also)\s+|,\s+create|,\s+assign|,\s+make/i)
        .map(c => c.trim())
        .filter(c => c.length > 0);
      
      return {
        isMultiCommand: commandParts.length > 1,
        commands: commandParts.length > 1 ? commandParts : [command]
      };
    }
  }

  async parseCommand(command: string): Promise<CommandIntent> {
    // 🆕 Get existing context
    const context = await this.getContextData();
    
    const prompt = `
You are an AI assistant specialized in parsing Role-Based Access Control (RBAC) commands.
Parse the following natural language command and extract the intent and entities.

Command: "${command}"

IMPORTANT - Available Context (existing roles and permissions in the system):
Roles: ${context.roleNames.length > 0 ? context.roleNames.join(', ') : 'None yet'}
Permissions: ${context.permissions.length > 0 ? context.permissions.map(p => `${p.name}${p.description ? ` (${p.description})` : ''}`).join(', ') : 'None yet'}

🔑 KEY INSTRUCTION: Use contextual understanding to match natural language to actual permission names.
- If user says "view dashboard", match it to "can_view_dashboard" permission if it exists
- If user says "edit posts", match it to "can_edit_posts" or "edit_posts" if it exists
- If user says "content editor" role, match it to "content_editor" or "editor" if it exists
- Be flexible with naming variations (underscores, spaces, prefixes like "can_")

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

Rules:
- "action" must be one of the specified values
- "confidence" should be between 0 and 1 - BE GENEROUS with confidence (0.8+) if the intent is clear
- "suggestions" should contain alternative interpretations only if confidence < 0.7
- Extract entity names matching the ACTUAL names from the context above
- For assign/give/add commands with role and permission, always use "assign_permission"
- If the command mentions both a role name and permission name, confidence should be HIGH (0.9+)
- Use contextual matching to find the closest actual role/permission name

Examples:
- "create a permission called edit_articles" → action: "create_permission", permissionName: "edit_articles", confidence: 0.95
- "assign reader the permission can_read_articles" → action: "assign_permission", roleName: "reader", permissionName: "can_read_articles", confidence: 0.95
- "give admin role the delete_users permission" → action: "assign_permission", roleName: "admin", permissionName: "delete_users", confidence: 0.95
- "give permission to content editor to view dashboard" → If "content_editor" role and "can_view_dashboard" permission exist, action: "assign_permission", roleName: "content_editor", permissionName: "can_view_dashboard", confidence: 0.9
- "make a new role called moderator" → action: "create_role", roleName: "moderator", confidence: 0.9
- "list all roles" → action: "list_roles", confidence: 1.0

Important: Commands with clear role and permission intent should have HIGH confidence (0.85-0.95), even if the exact names don't match but can be inferred from context.

Now parse the command above and respond with JSON only.
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // Extract JSON from response (remove markdown code blocks if present)
      let jsonText = text;
      if (text.includes('```json')) {
        jsonText = text.split('```json')[1].split('```')[0].trim();
      } else if (text.includes('```')) {
        jsonText = text.split('```')[1].split('```')[0].trim();
      }
      
      const parsed: CommandIntent = JSON.parse(jsonText);
      
      // Boost confidence if we have clear entities for assign_permission
      if (parsed.action === 'assign_permission' && 
          parsed.entities.roleName && 
          parsed.entities.permissionName &&
          parsed.confidence < 0.85) {
        parsed.confidence = 0.85;
      }
      
      return parsed;
    } catch (error) {
      console.error('Error parsing command with Gemini:', error);
      
      // Fallback: Try simple pattern matching if Gemini fails
      return this.fallbackParser(command, context);
    }
  }

  // Fallback parser using regex patterns with context awareness
  private async fallbackParser(command: string, context?: { roleNames: string[], permissions: any[] }): Promise<CommandIntent> {
    if (!context) {
      context = await this.getContextData();
    }
    
    const lowerCommand = command.toLowerCase().trim();
    
    // Pattern: assign/give [role] [permission]
    const assignMatch = lowerCommand.match(/(?:assign|give|add)\s+(\w+)\s+(?:the\s+)?permission\s+['""]?(\w+)['""]?/i) ||
                       lowerCommand.match(/(?:assign|give|add)\s+(?:the\s+)?(?:role\s+)?['""]?(\w+)['""]?\s+(?:the\s+)?permission\s+(?:to\s+)?['""]?(\w+)['""]?/i) ||
                       lowerCommand.match(/(?:give|grant)\s+permission\s+to\s+(.+?)\s+to\s+(.+)/i);
    
    if (assignMatch) {
      const roleName = assignMatch[1].trim().replace(/['"]/g, '');
      const permissionName = assignMatch[2].trim().replace(/['"]/g, '');
      
      return {
        action: 'assign_permission',
        entities: {
          roleName: this.findClosestMatch(roleName, context.roleNames) || roleName,
          permissionName: this.findClosestMatch(permissionName, context.permissions.map(p => p.name)) || permissionName,
        },
        confidence: 0.85,
      };
    }
    
    // Pattern: create/make permission (improved)
    const permMatch = lowerCommand.match(/(?:create|make)\s+(?:a\s+)?(?:new\s+)?permission\s+(?:called\s+)?['""]?(\w+)['""]?/i);
    if (permMatch) {
      return {
        action: 'create_permission',
        entities: {
          permissionName: permMatch[1].trim(),
        },
        confidence: 0.85,
      };
    }
    
    // Pattern: create/make role (improved)
        const roleMatch = lowerCommand.match(/(?:create|make)\s+(?:a\s+)?(?:new\s+)?role\s+(?:called\s+)?['""]?([\w\s]+)['""]?/i);
    if (roleMatch) {
      return {
        action: 'create_role',
        entities: {
          roleName: roleMatch[1].trim(),
        },
        confidence: 0.85,
      };
    }
    
    return {
      action: 'unknown',
      entities: {},
      confidence: 0,
      suggestions: ['Please rephrase your command more clearly']
    };
  }

  // 🆕 Helper to find closest matching name from existing data
  private findClosestMatch(input: string, options: string[]): string | null {
    if (!options || options.length === 0) return null;
    
    const normalized = input.toLowerCase().replace(/[-\s]/g, '_');
    
    // Exact match
    const exactMatch = options.find(opt => opt.toLowerCase() === normalized);
    if (exactMatch) return exactMatch;
    
    // Partial match (contains)
    const partialMatch = options.find(opt => 
      opt.toLowerCase().includes(normalized) || 
      normalized.includes(opt.toLowerCase())
    );
    if (partialMatch) return partialMatch;
    
    // Match with common prefixes
    const withPrefix = options.find(opt => 
      opt.toLowerCase() === `can_${normalized}` ||
      opt.toLowerCase() === `${normalized}_permission` ||
      normalized === `can_${opt.toLowerCase()}`
    );
    if (withPrefix) return withPrefix;
    
    return null;
  }

  async suggestCorrections(command: string, error: string): Promise<string[]> {
    const prompt = `
The user tried to execute this RBAC command: "${command}"
But it failed with this error: "${error}"

Provide 3 helpful suggestions to fix the command. Be specific and actionable.
Respond with a JSON array of strings.

Example: ["Create the role first using: create role editor", "Check if the permission name is spelled correctly", "Use quotes around names with spaces"]
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      let jsonText = text;
      if (text.includes('```json')) {
        jsonText = text.split('```json')[1].split('```')[0].trim();
      } else if (text.includes('```')) {
        jsonText = text.split('```')[1].split('```')[0].trim();
      }

      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Error getting suggestions from Gemini:', error);
      return [
        'Please check if the role or permission exists',
        'Try using simpler command structure',
        'Make sure names are spelled correctly'
      ];
    }
  }
}

export const geminiService = new GeminiService();
