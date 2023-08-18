import axios from "axios";
import { redirect } from 'next/navigation';
import { cookies } from "next/headers";
import { SpotifyAuthApiResponse, SpotifyUserResponse } from "@/libs/type/spotifyapi";

export async function GET(req:any,res:any) {
  
  const { searchParams } = new URL(req.url!);
  const code = searchParams.get('code');
  const cookie = cookies();

  const params = new URLSearchParams();
  params.append('code', code as string);
  params.append('redirect_uri', process.env.NEXT_PUBLIC_RETURN_TO as string);
  params.append('grant_type', 'authorization_code');

  const response = await axios.post<SpotifyAuthApiResponse>(
    'https://accounts.spotify.com/api/token',
    params,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET}`, 'utf-8').toString('base64')}`
      }
    }
  );
  const userResponse = await axios.get<SpotifyUserResponse>(
    `https://api.spotify.com/v1/me`,
    {
        headers: {
            'Authorization': `Bearer ${response.data.access_token}`
        }
    }
  );

  const hour = 60*60*1000
  const expiredUnixTime = Date.now() + hour
  console.log(expiredUnixTime)

  cookie.set({
    name: 'access_token',
    expires: expiredUnixTime,
    value: response.data.access_token,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  cookie.set({
    name: 'refresh_token',
    expires: expiredUnixTime,
    value: response.data.refresh_token,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  cookie.set({
    name: 'user_id',
    expires: expiredUnixTime,
    value: userResponse.data.id.toString(),
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  redirect('/')

}