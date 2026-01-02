import { NextResponse } from 'next/server';
import { getConfig, saveConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET() {
    const config = await getConfig();
    return NextResponse.json(config);
}

export async function POST(request) {
    try {
        const body = await request.json();
        const config = await saveConfig(body);
        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
