import { SpotifyUserResponse } from "@/libs/type/spotifyapi";
import axios from "axios";
import { cookies } from "next/headers";
import executeRefreshToken from '@/libs/util/refreshToken';
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req:any, res:any) {
    try {
        const cookie = cookies()
        const accessToken = cookie.get('access_token')?.value
        const refreshToken = cookie.get('refresh_token')?.value
        const userId = cookie.get('user_id')?.value
        
        try {
            await axios.get<SpotifyUserResponse>(
                `https://api.spotify.com/v1/me`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );
        }catch{
            if (refreshToken) {
                const response = await executeRefreshToken(refreshToken);
                const hour = 60*60*1000
                const expiredUnixTime = Date.now() + hour
                cookie.set({
                    name: 'access_token',
                    expires: expiredUnixTime,
                    value: response.access_token,
                    httpOnly: true,
                    sameSite: 'lax',
                    path: '/',
                })
                
                cookie.set({
                    name: 'refresh_token',
                    expires: expiredUnixTime,
                    value: refreshToken,
                    httpOnly: true,
                    sameSite: 'lax',
                    path: '/',
                })
            
                cookie.set({
                    name: 'user_id',
                    expires: expiredUnixTime,
                    value: userId!.toString(),
                    httpOnly: true,
                    sameSite: 'lax',
                    path: '/',
                })

                return NextResponse.json({ 
                    status: 200,
                    accessToken: response.access_token 
                })
            } else {
                return NextResponse.json({ 
                    status: 401,
                    message: 'unauthorized' 
                });
            }
        }

        return NextResponse.json({ 
            status: 200,
        });
    }catch(e:any){
        return NextResponse.json({ 
            status: 500,
            message: e.message,
        });
    }
}