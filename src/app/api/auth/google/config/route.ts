import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function getGoogleClientId(): string {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID.trim()) {
    return process.env.GOOGLE_CLIENT_ID.trim();
  }
  if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.trim()) {
    return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID.trim();
  }
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

function getGoogleClientSecret(): string {
  if (process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_SECRET.trim()) {
    return process.env.GOOGLE_CLIENT_SECRET.trim();
  }
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/GOOGLE_CLIENT_SECRET=["']?([^"'\r\n]+)["']?/);
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
    const clientSecret = getGoogleClientSecret();
    return NextResponse.json({
      clientId,
      clientSecret,
      isConfigured: Boolean(clientId && clientId.includes('.apps.googleusercontent.com')),
      hasSecret: Boolean(clientSecret && clientSecret.startsWith('GOCSPX-')),
    });
  } catch (error) {
    console.error('Error fetching Google auth config:', error);
    return NextResponse.json({ error: 'Failed to read Google configuration' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, clientSecret } = body;

    const trimmedClientId = typeof clientId === 'string' ? clientId.trim() : '';
    const trimmedSecret = typeof clientSecret === 'string' ? clientSecret.trim() : '';

    if (!trimmedClientId && !trimmedSecret) {
      return NextResponse.json({ error: 'Google Client ID or Client Secret is required' }, { status: 400 });
    }

    // Update in-memory process.env
    if (trimmedClientId) {
      process.env.GOOGLE_CLIENT_ID = trimmedClientId;
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = trimmedClientId;
    }
    if (trimmedSecret) {
      process.env.GOOGLE_CLIENT_SECRET = trimmedSecret;
    }

    // Persist to .env
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    if (trimmedClientId) {
      if (envContent.includes('GOOGLE_CLIENT_ID=')) {
        envContent = envContent.replace(
          /GOOGLE_CLIENT_ID=.*/,
          `GOOGLE_CLIENT_ID="${trimmedClientId}"`
        );
      } else {
        envContent += `\nGOOGLE_CLIENT_ID="${trimmedClientId}"\n`;
      }
    }

    if (trimmedSecret) {
      if (envContent.includes('GOOGLE_CLIENT_SECRET=')) {
        envContent = envContent.replace(
          /GOOGLE_CLIENT_SECRET=.*/,
          `GOOGLE_CLIENT_SECRET="${trimmedSecret}"`
        );
      } else {
        envContent += `\nGOOGLE_CLIENT_SECRET="${trimmedSecret}"\n`;
      }
    }

    fs.writeFileSync(envPath, envContent, 'utf8');

    const updatedClientId = getGoogleClientId();
    const updatedSecret = getGoogleClientSecret();

    return NextResponse.json({
      success: true,
      message: 'Google OAuth credentials saved and activated successfully!',
      clientId: updatedClientId,
      clientSecret: updatedSecret,
      isConfigured: Boolean(updatedClientId && updatedClientId.includes('.apps.googleusercontent.com')),
      hasSecret: Boolean(updatedSecret && updatedSecret.startsWith('GOCSPX-')),
    });
  } catch (error: any) {
    console.error('Error saving Google credentials:', error);
    return NextResponse.json({ error: error?.message || 'Failed to save Google credentials' }, { status: 500 });
  }
}
