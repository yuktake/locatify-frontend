"use client"

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
    width: "100%",
    height: "100vh",
};

const zoom = 13;

export default function Post(){

    const [query, setQuery] = useState<string>('');
    const [tracks, setTracks] = useState([]);
    const [selected_track, setSelectedTrack] = useState<string>('');

    const [current_latitude, setCurrentLatitude] = useState<number>(0);
    const [current_longitude, setCurrentLongitude] = useState<number>(0);

    const [center_latitude, setCenterLatitude] = useState<number>(0);
    const [center_longitude, setCenterLongitude] = useState<number>(0);

    const [clicked_latitude, setClickedLatitude] = useState<number>(0);
    const [clicked_longitude, setClickedLongitude] = useState<number>(0);

    const [map, setMap] = useState<any>(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string
    })

    const center = {
        lat: center_latitude,
        lng: center_longitude,
    };

    const current = {
        lat: current_latitude,
        lng: current_longitude,
    };

    const clicked = {
        lat: clicked_latitude,
        lng: clicked_longitude,
    }

    useEffect(() => {
        if('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
        }
        checkLoginApi()
    }, []);

    async function checkLoginApi(){
        const res = await axios.get(`/api/auth/check`)
    
        if(res.data.status == 401) {
          window.location.href = '/'
        }
    }

    // 取得に成功した場合の処理
    function successCallback(position:any){
        // 緯度・経度を取得し画面に表示
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setCurrentLatitude(latitude)
        setCurrentLongitude(longitude)
        setCenterLatitude(latitude)
        setCenterLongitude(longitude)
    };

    function clickMap(e:any){
        setClickedLatitude(e.latLng.lat())
        setClickedLongitude(e.latLng.lng())
        setCenterLatitude(e.latLng.lat())
        setCenterLongitude(e.latLng.lng())
    }

    function toCurrent() {
        if(map == null) {
            return
        }
        map.panTo({lat:current_latitude, lng:current_longitude})
    }

    // 取得に失敗した場合の処理
    function errorCallback(error:any){
        alert("位置情報が取得できませんでした");
    };

    const searchTracksByKeyword = (q: string) => {
        setQuery(q);
        axios.get('/api/track/search?q='+q).then((response) => {
            setTracks(response.data.tracks)
        });
    }

    const postLocation = () => {
        if (clicked_latitude == 0 || clicked_longitude == 0 || selected_track == '') {
            alert('曲と位置を設定してください')
            return
        }
        const params = {
            lat: clicked_latitude.toString(),
            lng: clicked_longitude.toString(),
            mid: selected_track,
        };
        axios.post('/api/location/post', params).then((response) => {
            setSelectedTrack('')
            setClickedLatitude(0)
            setClickedLongitude(0)
        })
        alert('success')
        window.location.href = '/'
    }

    if(!isLoaded) {
        return (
            <></>
        )
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center px-24 py-4">
            <div className="flex items-start justify-start w-full">
                <a className='font-serif text-4xl' href="/">Locatify</a>
            </div>
            <div className="flex sm:w-full md:w-5/6 lg:w-full h-screen">
                <div className="flex flex-col items-start justify-start sm:w-full md:w-5/6 lg:w-1/2">
                    <div className='flex items-center justify-end w-full'>
                        <button onClick={() => toCurrent()}>
                            <img src="/near.svg" alt="" width={24} />
                        </button>
                    </div>

                    <GoogleMap 
                        mapContainerStyle={containerStyle} 
                        center={center} 
                        zoom={zoom} 
                        onLoad={map=>setMap(map)}
                        onClick={clickMap}
                    >
                        {clicked.lat != 0 && <Marker 
                            position={clicked} 
                            label='' 
                            icon={{
                                url: '/music.svg',
                                scaledSize: new google.maps.Size(40,40)
                            }}
                        />}
                        <Marker 
                            position={current} 
                            label=''
                            icon={{
                                url: '/me.svg',
                                scaledSize: new google.maps.Size(40,40)
                            }}
                        />
                    </GoogleMap>
                </div>

                <div className="flex flex-col items-start justify-start sm:w-full md:w-5/6 lg:w-1/2 m-3">
                    <div className='flex items-center justify-between w-full'>
                        <input
                            className='text-black'
                            placeholder="Search Tracks"
                            onChange={(e) => { searchTracksByKeyword(e.target.value.replace(/　/g, ' ')) }}
                        />

                        <button onClick={() => {postLocation()}} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>POST</button>
                    </div>

                    <div className='overflow-auto'>
                        {tracks.map((track:any) => (
                            <div key={track.id} className={selected_track == track.id ? "my-5 bg-amber-300" : "my-5"}>
                                <p>{track.name}</p>
                                <img
                                className="my-2"
                                src={track.album.images[0].url}
                                width={180}
                                height={37}
                                alt='album_img'
                                onClick={() => setSelectedTrack(track.id)}
                                />
                                {track.preview_url != null && <audio controls src={track.preview_url} muted></audio>}
                                <span>--------</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}