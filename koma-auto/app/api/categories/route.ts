import { NextResponse } from 'next/server';
import { getProductFolders } from '@/lib/moysklad';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const foldersRes = await getProductFolders();
    const categories = foldersRes.rows.map((folder: any) => ({
      id: folder.id,
      name: folder.name
    }));

    // Sort categories alphabetically
    categories.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
