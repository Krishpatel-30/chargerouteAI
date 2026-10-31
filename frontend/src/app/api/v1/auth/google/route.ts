import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || "").toLowerCase().trim();
    if (!email) {
      return NextResponse.json(
        { detail: "Email address is required." },
        { status: 400 }
      );
    }

    const fullName =
      body.full_name?.trim() ||
      email
        .split("@")[0]
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (char: string) => char.toUpperCase());

    const user = {
      id: body.google_id || `usr_g_${Date.now()}`,
      email,
      full_name: fullName,
      avatar_url: body.avatar_url || null,
      role: "driver",
      is_admin: false,
      is_active: true,
      is_verified: true,
      created_at: new Date().toISOString(),
    };

    // Return a JWT-like bearer token containing user metadata
    const tokenPayload = Buffer.from(JSON.stringify(user)).toString("base64");
    const accessToken = `vt_${tokenPayload}`;

    return NextResponse.json({
      access_token: accessToken,
      token_type: "bearer",
      user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { detail: error?.message || "Internal server error during Google authentication." },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
