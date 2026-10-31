import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || "").toLowerCase().trim();
    const password = body.password || "";
    const fullName =
      body.full_name?.trim() ||
      email
        .split("@")[0]
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (char: string) => char.toUpperCase());

    if (!email || !password) {
      return NextResponse.json(
        { detail: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = {
      id: `usr_${Date.now()}`,
      email,
      full_name: fullName,
      avatar_url: null,
      role: "driver",
      is_admin: false,
      is_active: true,
      is_verified: true,
      created_at: new Date().toISOString(),
    };

    const tokenPayload = Buffer.from(JSON.stringify(user)).toString("base64");
    const accessToken = `vt_${tokenPayload}`;

    return NextResponse.json({
      access_token: accessToken,
      token_type: "bearer",
      user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { detail: error?.message || "Registration failed." },
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
