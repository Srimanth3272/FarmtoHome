import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function getGoogleClientId(): string {
  // Check env variable
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID.trim()) {
    return process.env.GOOGLE_CLIENT_ID.trim();
  }
  if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.trim()) {
    return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.trim();
  }
  // Check .env file directly if available
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/GOOGLE_CLIENT_ID=["']?([^"'\r\n]+)["']?/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  } catch (err) {
    // Ignore error
  }
  return '';
}

export async function GET() {
  try {
    const clientId = getGoogleClientId();
    return NextResponse.json({
      clientId,
      isConfigured: Boolean(clientId && clientId.includes('.apps.googleusercontent.com')),
    });
  } catch (error) {
    console.error('Error fetching Google auth config:', error);
    return NextResponse.json({ error: 'Failed to read Google configuration' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId } = body;

    if (!clientId || typeof clientId !== 'string') {
      return NextResponse.json({ error: 'Google Client ID is required' }, { status: 400 });
    }

    const trimmedClientId = clientId.trim();

    // Update in-memory process.env
    process.env.GOOGLE_CLIENT_ID = trimmedClientId;
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = trimmedClientId;

    // Persist to .env
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    if (envContent.includes('GOOGLE_CLIENT_ID=')) {
      envContent = envContent.replace(
        /GOOGLE_CLIENT_ID=.*/,
        `GOOGLE_CLIENT_ID="${trimmedClientId}"`
      );
    } else {
      envContent += `\n# Google OAuth Configuration\nGOOGLE_CLIENT_ID="${trimmedClientId}"\n`;
    }

    fs.writeFileSync(envPath, envContent, 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Google Client ID saved and activated successfully!',
      clientId: trimmedClientId,
      isConfigured: true,
    });
  } catch (error: any) {
    console.error('Error saving Google Client ID:', error);
    return NextResponse.json({ error: error?.message || 'Failed to save Google Client ID' }, { status: 500 });
  }
}
