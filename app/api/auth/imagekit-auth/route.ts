
import { getUploadAuthParams } from "@imagekit/next/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const publicKey = process.env.NEXT_PUBLIC_PUBLIC_KEY;

    if (!privateKey || !publicKey) {
      console.error("ImageKit environment variables are missing");

      return NextResponse.json(
        { error: "ImageKit configuration is missing on the server." },
        { status: 500 }
      );
    }

    const authenticationParameters = getUploadAuthParams({
      privateKey,
      publicKey,
    });

    return NextResponse.json({
      authenticationParameters,
      publicKey,
    });
  } catch (error) {
    console.error("ImageKit authentication error:", error);

    return NextResponse.json(
      { error: "Failed to generate ImageKit upload authentication." },
      { status: 500 }
    );
  }
}
