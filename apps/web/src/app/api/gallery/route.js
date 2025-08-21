import sql from '@/app/api/utils/sql';

// GET /api/gallery - Fetch all gallery entries
export async function GET(request) {
  try {
    const entries = await sql`
      SELECT id, image_url, caption, created_at 
      FROM gallery_entries 
      ORDER BY created_at DESC
    `;

    return Response.json({
      success: true,
      entries: entries || []
    });
  } catch (error) {
    console.error('Error fetching gallery entries:', error);
    return Response.json(
      { success: false, error: 'Failed to fetch gallery entries' },
      { status: 500 }
    );
  }
}

// POST /api/gallery - Create new gallery entry
export async function POST(request) {
  try {
    const body = await request.json();
    const { image_url, caption } = body;

    if (!image_url) {
      return Response.json(
        { success: false, error: 'Image URL is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO gallery_entries (image_url, caption)
      VALUES (${image_url}, ${caption || null})
      RETURNING id, image_url, caption, created_at
    `;

    const newEntry = result[0];

    return Response.json({
      success: true,
      entry: newEntry
    });
  } catch (error) {
    console.error('Error creating gallery entry:', error);
    return Response.json(
      { success: false, error: 'Failed to create gallery entry' },
      { status: 500 }
    );
  }
}