import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Middleware to check authentication
function checkAuth(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return null;
  }
  return verifyToken(token);
}

// Simple NLP parser for RBAC commands
function parseCommand(command: string) {
  const lowerCommand = command.toLowerCase().trim();

  // Create permission
  if (lowerCommand.includes('create') && lowerCommand.includes('permission')) {
    const match = lowerCommand.match(/create.*permission.*['"'](.+?)['"']/i) ||
                  lowerCommand.match(/create.*permission.*called\s+(.+?)(?:\s|$)/i);
    if (match) {
      return {
        action: 'create_permission',
        name: match[1].trim(),
      };
    }
  }

  // Create role
  if (lowerCommand.includes('create') && lowerCommand.includes('role')) {
    const match = lowerCommand.match(/create.*role.*['"'](.+?)['"']/i) ||
                  lowerCommand.match(/create.*role.*called\s+(.+?)(?:\s|$)/i);
    if (match) {
      return {
        action: 'create_role',
        name: match[1].trim(),
      };
    }
  }

  // Assign permission to role
  if (
    (lowerCommand.includes('give') || lowerCommand.includes('assign') || lowerCommand.includes('add')) &&
    lowerCommand.includes('role') &&
    lowerCommand.includes('permission')
  ) {
    const roleMatch = lowerCommand.match(/role\s+['"'](.+?)['"']/i);
    const permMatch = lowerCommand.match(/permission.*['"'](.+?)['"']/i) ||
                      lowerCommand.match(/to\s+['"'](.+?)['"']/i);
    
    if (roleMatch && permMatch) {
      return {
        action: 'assign_permission',
        roleName: roleMatch[1].trim(),
        permissionName: permMatch[1].trim(),
      };
    }
  }

  return { action: 'unknown' };
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

    const parsed = parseCommand(command);

    switch (parsed.action) {
      case 'create_permission': {
        const permission = await prisma.permission.create({
          data: {
            name: parsed.name!,
            description: `Created via AI command`,
          },
        });
        return NextResponse.json({
          success: true,
          message: `Permission "${parsed.name}" created successfully`,
          data: permission,
        });
      }

      case 'create_role': {
        const role = await prisma.role.create({
          data: {
            name: parsed.name!,
          },
        });
        return NextResponse.json({
          success: true,
          message: `Role "${parsed.name}" created successfully`,
          data: role,
        });
      }

      case 'assign_permission': {
        const role = await prisma.role.findFirst({
          where: { name: { equals: parsed.roleName, mode: 'insensitive' } },
        });
        const permission = await prisma.permission.findFirst({
          where: { name: { equals: parsed.permissionName, mode: 'insensitive' } },
        });

        if (!role) {
          return NextResponse.json(
            { success: false, error: `Role "${parsed.roleName}" not found` },
            { status: 404 }
          );
        }
        if (!permission) {
          return NextResponse.json(
            { success: false, error: `Permission "${parsed.permissionName}" not found` },
            { status: 404 }
          );
        }

        const rolePermission = await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });

        return NextResponse.json({
          success: true,
          message: `Permission "${parsed.permissionName}" assigned to role "${parsed.roleName}"`,
          data: rolePermission,
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Could not understand the command. Try commands like: "Create a permission called edit_posts" or "Give the role Content Editor the permission to edit_posts"',
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error processing AI command:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Item already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
