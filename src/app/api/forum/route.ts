import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'forumData.json');

export async function GET() {
    try {
        const fileData = await fs.readFile(dataFilePath, 'utf-8');
        return NextResponse.json(JSON.parse(fileData));
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            return NextResponse.json([]);
        }
        return NextResponse.json({ error: 'Failed to read forum data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const post = await request.json();
        
        let posts = [];
        try {
            const fileData = await fs.readFile(dataFilePath, 'utf-8');
            posts = JSON.parse(fileData);
        } catch (error: any) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
        
        posts.unshift(post);
        await fs.writeFile(dataFilePath, JSON.stringify(posts, null, 2), 'utf-8');
        
        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save forum data' }, { status: 500 });
    }
}
