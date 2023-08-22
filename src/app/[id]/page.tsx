"use client"

import { useState } from 'react';
import axios from 'axios';
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Location } from '@/libs/type/spotifyapi';

const containerStyle = {
    width: "100%",
    height: "100vh",
};

const zoom = 13;

export default function Preview({
    params: { id },
}: {
    params: { id: number };
}) {

    const [location, setLocation] = useState<Location | null>(null);
    const [center_latitude, setCenterLatitude] = useState<number>(0);
    const [center_longitude, setCenterLongitude] = useState<number>(0);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string
    })

    const center = {
        lat: center_latitude,
        lng: center_longitude,
    };

    async function getLocation(id:number) {
        const response = await axios.get(`/api/location/${id}`)
        if(response.data.status == 404) {
            window.location.href = ''
        }
        const location = response.data.location
        setLocation(location)
        setCenterLatitude(location.x)
        setCenterLongitude(location.y)
    }

    if(location == null) {
        getLocation(id)
    }

    if(!isLoaded) {
        return (
          <></>
        )
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center px-12 py-4">
            <head>
                <script async src="https://platform.twitter.com/widgets.js"></script>
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:title" content='Locatify' />
                <meta
                    property="twitter:description"
                    content="I am listening to..."
                />
                <meta property="og:image" content={location?.thumbnail} />
                <meta property="twitter:image" content={location?.thumbnail} />
            </head>

            <div className="flex flex-col items-center justify-center h-screen">
                <div className="flex items-center justify-between w-full">
                    <a className='font-serif text-4xl' href="/">Locatify</a>
                    <a className="twitter-share-button" href="https://twitter.com/intent/tweet"></a>
                </div>
                {location != null && 
                    <div>
                        <div className='text-xl flex items-center justify-start title-h'>
                            <p>{location.track_name}</p>
                        </div>
                        <div className='flex items-center justify-end title-h'>
                            <p>By: {location.artist_name}</p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <img className='w-full' src={location.thumbnail} alt="" />
                            <audio className='my-3 audio-h w-full' controls src={location.preview_url}></audio>
                        </div>
                    </div>
                }
            </div>

            <div className="flex flex-col items-start justify-start w-full">
                <GoogleMap 
                    mapContainerStyle={containerStyle} 
                    center={center} 
                    zoom={zoom}
                >
                    {center_latitude != 0 && <Marker 
                        position={center} 
                        label=''
                        icon={{
                            url: '/music.svg',
                            scaledSize: new google.maps.Size(40,40)
                        }}
                    />}
                </GoogleMap>
            </div>
        </main>
    )
}