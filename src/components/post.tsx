"use client"

import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Location } from '@/libs/type/spotifyapi';
import Script from 'next/script'

const containerStyle = {
    width: "100%",
    height: "100vh",
};

const zoom = 13;

export type PostProps = {
    location: Location,
}

export const PostComponent = ({ location }: PostProps) => {

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string
    })

    const center = {
        lat: location.x,
        lng: location.y,
    };

    if(!isLoaded) {
        return (
          <></>
        )
    }

    return (
        <>
            <Script src='https://platform.twitter.com/widgets.js'/>
            <main className="flex min-h-screen flex-col items-center justify-center px-12 py-4">
                <div className="flex flex-col items-center justify-center">
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
                        {center.lat != 0 && <Marker 
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
        </>
    )
}