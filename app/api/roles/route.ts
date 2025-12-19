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

// GET all roles
export async function GET(request: NextRequest) {
  try {
    const user = checkAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roles = await prisma.role.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new role
export async function POST(request: NextRequest) {
  try {
    const user = checkAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Role name is required' },
        { status: 400 }
      );
    }

    const role = await prisma.role.create({
      data: { name },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error: any) {
    console.error('Error creating role:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Role name already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update role
export async function PUT(request: NextRequest) {
  try {
    const user = checkAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: 'Role ID and name are required' },
        { status: 400 }
      );
    }

    const role = await prisma.role.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(role);
  } catch (error: any) {
    console.error('Error updating role:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Role name already exists' },
        { status: 400 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE role
export async function DELETE(request: NextRequest) {
  try {
    const user = checkAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Role ID is required' },
        { status: 400 }
      );
    }

    await prisma.role.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting role:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
