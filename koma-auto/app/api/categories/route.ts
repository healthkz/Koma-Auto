import { NextResponse } from 'next/server';
import { DISPLAY_CATEGORIES } from '@/lib/categoryMapping';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(DISPLAY_CATEGORIES);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
