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

// GET all permissions
export async function GET(request: NextRequest) {
  try {
    const user = checkAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const permissions = await prisma.permission.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        rolePermissions: {
          include: {
            role: true,
          },
        },
      },
    });

    return NextResponse.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST create new permission
export async function POST(request: NextRequest) {
  try {
    const user = checkAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Permission name is required' },
        { status: 400 }
      );
    }

    const permission = await prisma.permission.create({
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(permission, { status: 201 });
  } catch (error: any) {
    console.error('Error creating permission:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Permission name already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT update permission
export async function PUT(request: NextRequest) {
  try {
    const user = checkAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, description } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: 'Permission ID and name are required' },
        { status: 400 }
      );
    }

    const permission = await prisma.permission.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(permission);
  } catch (error: any) {
    console.error('Error updating permission:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Permission name already exists' },
        { status: 400 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE permission
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
        { error: 'Permission ID is required' },
        { status: 400 }
      );
    }

    await prisma.permission.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Permission deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting permission:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
