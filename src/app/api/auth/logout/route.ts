import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const cookie = cookies();

    cookie.delete('access_token')
    cookie.delete('refresh_token')
    cookie.delete('user_id')

    return NextResponse.json({ 
        status: 200
    })
}