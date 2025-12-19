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

// POST - Assign permission to role
export async function POST(request: NextRequest) {
  try {
    const user = checkAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { roleId, permissionId } = body;

    if (!roleId || !permissionId) {
      return NextResponse.json(
        { error: 'Role ID and Permission ID are required' },
        { status: 400 }
      );
    }

    const rolePermission = await prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
      include: {
        role: true,
        permission: true,
      },
    });

    return NextResponse.json(rolePermission, { status: 201 });
  } catch (error: any) {
    console.error('Error assigning permission to role:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This permission is already assigned to this role' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove permission from role
export async function DELETE(request: NextRequest) {
  try {
    const user = checkAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('roleId');
    const permissionId = searchParams.get('permissionId');

    if (!roleId || !permissionId) {
      return NextResponse.json(
        { error: 'Role ID and Permission ID are required' },
        { status: 400 }
      );
    }

    await prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    return NextResponse.json({ message: 'Permission removed from role successfully' });
  } catch (error: any) {
    console.error('Error removing permission from role:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Role-Permission relationship not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
