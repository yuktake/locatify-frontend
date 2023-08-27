import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
    const postParams = await req.json();
    const params = new URLSearchParams();
    Object.keys(postParams).forEach((key) => {
        params.append(key, postParams[key])
    })

    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/locations?${params.toString()}`)

    return NextResponse.json(response.data)
}