export interface SpotifyAuthApiResponse {
    access_token: string,
    token_type: string,
    scope: string,
    expires_in: number,
    refresh_token: string
}

type TrackItem = {
    album: { href: string, name: string, images: { url: string, height: number }[] },
    artists: { href: string, name: string }[],
    href: string,
    id: string,
    name: string,
    uri: string,
    duration_ms:number,
}

export type SpotifySearchApiResponse = {
    tracks: {
        items: TrackItem[]
    }
}

export type SpotifyRecommendApiResponse = {
    tracks: TrackItem[]
}

export type AudioFeature = {
    danceability: number,
    energy: number,
    id: string,
    instrumentalness: number,
    key: number,
    liveness: number,
    loudness: number,
    mode: number,
    tempo: number,
    valence: number,
    track_href: string
}

export type SpotifyFeaturesApiResponse = {
    audio_features: AudioFeature[]
}

export type SearchTracksRecord = TrackItem & {
    audioFeatures?: AudioFeature
}

export type SearchTracksResponse = SearchTracksRecord[]

export type RecommendTracksResponse = {
    upperTracks: SearchTracksResponse,
    downerTracks: SearchTracksResponse
}

export interface SpotifyUserResponse {
    country: string,
    display_name: string,
    id: string,
    email: string,
}
  
export type Location = {
    id: number,
    uid: string,
    mid: string,
    track_name: string,
    artist_name: string,
    point: string,
    x: number,
    y: number,
    thumbnail: string,
    preview_url: string,
    created_at: string,
    updated_at: string
}

export type TrackMarker = {
    id: number,
    track_name:string,
    artist_name:string,
    point: {
        lat: number,
        lng:number,
    },
    url: string,
    preview_url: string,
}