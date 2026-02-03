import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://api.brawlstars.com/v1';
const API_KEY = process.env.BRAWL_STARS_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: { tag: string } }
) {
  try {
    const playerTag = params.tag;

    if (!API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // プレイヤータグから#を除去してURLエンコード
    const encodedTag = encodeURIComponent(playerTag.replace('#', ''));

    const response = await fetch(
      `${API_BASE_URL}/players/%23${encodedTag}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json',
        },
        next: { revalidate: 300 } // 5分間キャッシュ
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Player not found' },
          { status: 404 }
        );
      }
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'API access forbidden - IP not allowed' },
          { status: 403 }
        );
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching player data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player data' },
      { status: 500 }
    );
  }
}
