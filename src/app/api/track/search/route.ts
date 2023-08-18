import { SearchTracksResponse, SpotifySearchApiResponse } from "@/libs/type/spotifyapi";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export interface RequestBody { query: string[] }

export interface ResponseBody { tracks: SearchTracksResponse }

export async function GET(req: NextRequest) {
    try {
        const {searchParams} = new URL(req.url);
        const cookie = cookies()
        const q:string = searchParams.get('q')!;

        const accessToken = cookie.get('access_token')?.value;

        const params = new URLSearchParams();
        params.append('q', q);
        params.append('type', 'track');
        const searchResponse = await axios.get<SpotifySearchApiResponse>(
            `https://api.spotify.com/v1/search?${params.toString()}`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        const response: SearchTracksResponse = searchResponse.data.tracks.items.map((item) => {
            return { ...item};
        });

        return NextResponse.json({ tracks: response }, { status: 200 });
    } catch (e:any) {
        console.log('error')
        console.log(e.message)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}