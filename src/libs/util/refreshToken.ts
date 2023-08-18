import axios from 'axios';
import { SpotifyAuthApiResponse } from '../type/spotifyapi';

const refreshToken = async (refreshToken: string) => {

    const clientBuffer = Buffer.from(`${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET}`, 'utf-8');
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);
    const response = await axios.post<SpotifyAuthApiResponse>(
        'https://accounts.spotify.com/api/token',
        params,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${clientBuffer.toString('base64')}`
            }
        }
    );
    return response.data;
};
export default refreshToken;