import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/locations/${params.id}`)

    return NextResponse.json(response.data);
}