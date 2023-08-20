import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    const params = await req.json();
    const cookie = cookies()
    const accessToken = cookie.get('access_token')?.value

    if(params.lat == undefined || params.lng == undefined || params.mid == undefined) {
        return NextResponse.json({ status: 500 })
    }
    if(params.lat > 90 || params.lat < -90) {
        return NextResponse.json({ status: 500 })
    }
    if(params.lng > 180 || params.lat < -180) {
        return NextResponse.json({ status: 500 })
    }
    // midの存在確認
    const res = await axios.get(
        `https://api.spotify.com/v1/tracks/${params.mid}`,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${accessToken}`
            }
        }
    )
    if(res.data.error) {
        return NextResponse.json({ status: 404 });
    }

    const userId = cookie.get('user_id')?.value
    params.uid = userId
    params.track_name = res.data.album.name,
    params.artist_name = res.data.artists[0].name,
    params.thumbnail = res.data.album.images[0].url
    params.preview_url = res.data.preview_url
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/locations`, params)

    return NextResponse.json({ status: response.status });
}