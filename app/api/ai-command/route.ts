import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { geminiService } from '@/lib/gemini.service';

// Middleware to check authentication
function checkAuth(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return null;
  }
  return verifyToken(token);
}

// Helper function to execute a single command
async function executeSingleCommand(command: string, originalCommand?: string) {
  const intent = await geminiService.parseCommand(command);

  // If confidence is too low, return suggestions
  if (intent.confidence < 0.5) {
    return {
      success: false,
      command: command,
      error: 'Command unclear. Please be more specific.',
      suggestions: intent.suggestions || [],
      confidence: intent.confidence,
    };
  }

  // Execute the parsed command
  switch (intent.action) {
    case 'create_permission': {
      if (!intent.entities.permissionName) {
        return {
          success: false,
          command: command,
          error: 'Permission name not found in command',
        };
      }

      const permission = await prisma.permission.create({
        data: {
          name: intent.entities.permissionName,
          description: intent.entities.description || `Created via AI command`,
        },
      });

      return {
        success: true,
        command: command,
        message: `Permission "${intent.entities.permissionName}" created successfully`,
        data: permission,
        confidence: intent.confidence,
      };
    }

    case 'create_role': {
      if (!intent.entities.roleName) {
        return {
          success: false,
          command: command,
          error: 'Role name not found in command',
        };
      }

      const role = await prisma.role.create({
        data: {
          name: intent.entities.roleName,
        },
      });

      return {
        success: true,
        command: command,
        message: `Role "${intent.entities.roleName}" created successfully`,
        data: role,
        confidence: intent.confidence,
      };
    }

    case 'assign_permission': {
      if (!intent.entities.roleName || !intent.entities.permissionName) {
        return {
          success: false,
          command: command,
          error: 'Role name or permission name not found in command',
        };
      }

      const role = await prisma.role.findFirst({
        where: { name: { equals: intent.entities.roleName, mode: 'insensitive' } },
      });
      const permission = await prisma.permission.findFirst({
        where: { name: { equals: intent.entities.permissionName, mode: 'insensitive' } },
      });

      if (!role) {
        const suggestions = await geminiService.suggestCorrections(
          originalCommand || command,
          `Role "${intent.entities.roleName}" not found`
        );
        return {
          success: false,
          command: command,
          error: `Role "${intent.entities.roleName}" not found`,
          suggestions,
        };
      }

      if (!permission) {
        const suggestions = await geminiService.suggestCorrections(
          originalCommand || command,
          `Permission "${intent.entities.permissionName}" not found`
        );
        return {
          success: false,
          command: command,
          error: `Permission "${intent.entities.permissionName}" not found`,
          suggestions,
        };
      }

      // Check if the assignment already exists
      const existing = await prisma.rolePermission.findFirst({
        where: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });

      if (existing) {
        return {
          success: false,
          command: command,
          error: `Permission "${intent.entities.permissionName}" is already assigned to role "${intent.entities.roleName}"`,
          suggestions: [
            `The assignment already exists`,
            `Try: "remove ${intent.entities.roleName} permission ${intent.entities.permissionName}"`,
            `Try: "describe role ${intent.entities.roleName}"`
          ],
        };
      }

      const rolePermission = await prisma.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });

      return {
        success: true,
        command: command,
        message: `Permission "${intent.entities.permissionName}" assigned to role "${intent.entities.roleName}"`,
        data: rolePermission,
        confidence: intent.confidence,
      };
    }

    case 'remove_permission': {
      if (!intent.entities.roleName || !intent.entities.permissionName) {
        return {
          success: false,
          command: command,
          error: 'Role name or permission name not found in command',
        };
      }

      const role = await prisma.role.findFirst({
        where: { name: { equals: intent.entities.roleName, mode: 'insensitive' } },
      });
      const permission = await prisma.permission.findFirst({
        where: { name: { equals: intent.entities.permissionName, mode: 'insensitive' } },
      });

      if (!role || !permission) {
        return {
          success: false,
          command: command,
          error: 'Role or permission not found',
        };
      }

      const result = await prisma.rolePermission.deleteMany({
        where: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });

      if (result.count === 0) {
        return {
          success: false,
          command: command,
          error: `Permission "${intent.entities.permissionName}" was not assigned to role "${intent.entities.roleName}"`,
          suggestions: [
            `The assignment doesn't exist`,
            `Try: "describe role ${intent.entities.roleName}" to see current permissions`
          ],
        };
      }

      return {
        success: true,
        command: command,
        message: `Permission "${intent.entities.permissionName}" removed from role "${intent.entities.roleName}"`,
        confidence: intent.confidence,
      };
    }

    case 'list_roles': {
      const roles = await prisma.role.findMany({
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      return {
        success: true,
        command: command,
        message: 'Roles retrieved successfully',
        data: roles,
        confidence: intent.confidence,
      };
    }

    case 'list_permissions': {
      const permissions = await prisma.permission.findMany();

      return {
        success: true,
        command: command,
        message: 'Permissions retrieved successfully',
        data: permissions,
        confidence: intent.confidence,
      };
    }

    case 'describe_role': {
      if (!intent.entities.roleName) {
        return {
          success: false,
          command: command,
          error: 'Role name not found in command',
        };
      }

      const role = await prisma.role.findFirst({
        where: { name: { equals: intent.entities.roleName, mode: 'insensitive' } },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      if (!role) {
        return {
          success: false,
          command: command,
          error: `Role "${intent.entities.roleName}" not found`,
        };
      }

      return {
        success: true,
        command: command,
        message: `Role "${intent.entities.roleName}" details`,
        data: role,
        confidence: intent.confidence,
      };
    }

    default:
      return {
        success: false,
        command: command,
        error: 'Could not understand the command',
        suggestions: intent.suggestions || [
          'Try: "Create a permission called edit_posts"',
          'Try: "Give the role editor the permission edit_posts"',
          'Try: "List all roles"'
        ],
      };
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = checkAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { command } = body;

    if (!command) {
      return NextResponse.json(
        { error: 'Command is required' },
        { status: 400 }
      );
    }

    // Check for multiple commands
    const multiResult = await geminiService.detectMultipleCommands(command);

    if (multiResult.isMultiCommand) {
      // Execute all commands in sequence
      const results = [];
      let allSuccessful = true;

      for (const cmd of multiResult.commands) {
        try {
          const result = await executeSingleCommand(cmd, command);
          results.push(result);
          if (!result.success) {
            allSuccessful = false;
          }
        } catch (error: any) {
          results.push({
            success: false,
            command: cmd,
            error: error.code === 'P2002' ? 'Item already exists' : 'Error executing command',
          });
          allSuccessful = false;
        }
      }

      return NextResponse.json({
        success: allSuccessful,
        isMultiCommand: true,
        message: allSuccessful 
          ? `Successfully executed ${results.length} commands` 
          : `Executed ${results.length} commands with some failures`,
        results: results,
      }, { status: allSuccessful ? 200 : 207 }); // 207 = Multi-Status
    }

    // Single command execution
    try {
      const result = await executeSingleCommand(command);
      const statusCode = result.success ? 200 : (result.error?.includes('not found') ? 404 : 400);
      return NextResponse.json(result, { status: statusCode });
    } catch (error: any) {
      if (error.code === 'P2002') {
        const suggestions = await geminiService.suggestCorrections(
          command,
          'Item already exists'
        );
        return NextResponse.json(
          { success: false, error: 'Item already exists', suggestions },
          { status: 400 }
        );
      }

      console.error('Error executing command:', error);
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error processing AI command:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
