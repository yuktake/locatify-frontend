"use client"

import { useEffect, useState } from 'react';
import axios from 'axios';
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useSearchParams } from 'next/navigation';

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const zoom = 13;

export default function Home(){
  const [markers, setMarkers] = useState<any>([]);
  const [selected_marker, setSelectedMarker] = useState<any|null>(null);

  const [current_latitude, setCurrentLatitude] = useState<number>(0);
  const [current_longitude, setCurrentLongitude] = useState<number>(0);

  const [center_latitude, setCenterLatitude] = useState<number>(0);
  const [center_longitude, setCenterLongitude] = useState<number>(0);

  const [radius, setRadius] = useState<string>('1');
  const [map, setMap] = useState<any>(null);

  const [isLogged, setIsLogged] = useState<boolean>(false);

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

  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  useEffect(() => {
    if('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback)
    }
  }, []);

  checkLoginApi()

  async function checkLoginApi(){
    const res = await axios.get(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/check`)

    if(res.data.status == 200) {
      setIsLogged(true)
    } else if(res.data.status == 401) {
      setIsLogged(false)
    }
  }

  async function logout() {
    const res = await axios.post(`/api/auth/logout`)
    if(res.status = 200) {
      setIsLogged(false)
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

  function selectMarker(marker:any) {
    setCenterLatitude(marker.point.lat)
    setCenterLongitude(marker.point.lng)
    setSelectedMarker(marker)
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

  const searchLocation = (lat: number, lng: number) => {
    const params = new URLSearchParams();
    params.append('lat', lat.toString())
    params.append('lng', lng.toString())
    params.append('radius', radius.toString())

    const tmpMarkers:Array<any> = []
    axios.get(`/api/location/search?${params.toString()}`).then((response) => {
      response.data.locations.forEach((location:any) => {
        const tmpMarker: { [name: string]: any } = {};
        tmpMarker['id'] = location.id
        tmpMarker['track_name'] = location.track_name
        tmpMarker['artist_name'] = location.artist_name
        tmpMarker['point'] = {lat: location.x, lng: location.y}
        tmpMarker['url'] = location.thumbnail
        tmpMarker['preview_url'] = location.preview_url
        tmpMarkers.push(tmpMarker)
      })

      setMarkers(tmpMarkers)
    })
  }

  const params = new URLSearchParams();
  params.append('client_id', process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '');
  params.append('response_type', 'code');
  params.append('redirect_uri', process.env.NEXT_PUBLIC_RETURN_TO || '');
  params.append('scope', 'user-read-private user-read-email');
  params.append('state', 'state');

  const url = `https://accounts.spotify.com/authorize?${params.toString()}`

  if(!isLoaded) {
    return (
      <></>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-24 py-4">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        { isLogged ? 
            <button onClick={logout}>
                <button type='button' className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'>LOGOUT</button>
            </button> : 
            <a href={url}>
                <button type='button' className='bg-neutral-700 hover:bg-stone-900 text-green-500 font-bold py-2 px-4 rounded'>Sign in with Spotify</button>
            </a> 
        }
        { isLogged && <a className='flex justify-end' href="/post">
            <button type='button' className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>POST</button>
        </a> }
      </div>

      <div className="flex sm:w-full md:w-5/6 lg:w-full h-screen">
        <div className="flex flex-col items-start justify-start sm:w-full md:w-5/6 lg:w-1/2">
          <div className='flex items-center justify-between w-full'>
            <div className='flex items-center my-3'>
              <button onClick={() => {searchLocation(current_latitude,current_longitude)}}>
                <img src="/search.svg" alt="" width={24} />
              </button>
              <span>半径</span>
              <select
                className='text-black ml-3'
                onChange={(e) => {
                  setRadius(e.target.value)
                }}
              >
                <option value="1">1km</option>
                <option value="5">5km</option>
                <option value="10">10km</option>
                <option value="100">100km</option>
              </select>
            </div>

            <button onClick={() => toCurrent()}>
                <img src="/near.svg" alt="" width={24} />
            </button>

          </div>

          <GoogleMap 
            mapContainerStyle={containerStyle} 
            center={center} 
            onLoad={map=>setMap(map)}
            zoom={zoom}
          >
            {center_latitude != 0 && <Marker 
                position={current} 
                label=''
                icon={{
                  url: '/me.svg',
                  scaledSize: new google.maps.Size(40,40)
                }}
            />}

            {markers.map((marker:any) => (
              <Marker 
                onClick={() => selectMarker(marker)}
                key={marker.id}
                position={marker.point} 
                label=''
                icon={{
                  url: '/music.svg',
                  scaledSize: new google.maps.Size(40,40)
                }}
              />
            ))}
          </GoogleMap>
        </div>

        <div className="flex flex-col items-start justify-center sm:w-full md:w-5/6 lg:w-1/2 m-3">
            {selected_marker != null && 
                <div className='w-full'>
                    <div className='flex items-center justify-between'>
                        <p>{selected_marker.track_name}</p>
                        <p>{selected_marker.artist_name}</p>
                    </div>
                    <img src={selected_marker.url} />
                    {selected_marker.preview_url != null && <audio className='w-full mt-3' controls src={selected_marker.preview_url} muted></audio>}
                </div>
            }
        </div>
      </div>
    </main>
  )
};
