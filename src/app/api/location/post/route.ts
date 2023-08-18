import { NextRequest } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
    const res = await req.json();
    console.log(res)
    // axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/v1/locations`, params).then((response) => {
      
    // })
}