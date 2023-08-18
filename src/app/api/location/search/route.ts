import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url!);
    
    const params = new URLSearchParams();
    searchParams.forEach((value,name) => {
        params.append(name, value)
    })
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/v1/locations?${params.toString()}`)

    return NextResponse.json(response.data)
}