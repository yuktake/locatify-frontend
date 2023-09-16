"use client"

import { useState } from 'react';
import axios from 'axios';
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Location, TrackMarker } from '@/libs/type/spotifyapi';

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const zoom = 13;

export default function Home(){
  const [markers, setMarkers] = useState<TrackMarker[]>([]);
  const [selected_marker, setSelectedMarker] = useState<TrackMarker|null>(null);

  const [current_center, setCurrentCenter] = useState<any>({lat: 0, lng:0});
  const [center, setCenter] = useState<any>({lat: 0, lng:0});

  const [radius, setRadius] = useState<string>('1');
  const [map, setMap] = useState<google.maps.Map|null>(null);

  const [isLogged, setIsLogged] = useState<boolean>(false);
  const [state, setState] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string
  })

  checkLoginApi()

  function init(map: google.maps.Map) {
    setMap(map)
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback)
  }

  async function checkLoginApi(){
    const res = await axios.get(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/check`)

    if(res.data.status == 200) {
      setIsLogged(true)
      setUserId(res.data.userId)
    } else if(res.data.status == 401) {
      setIsLogged(false)
    }
  }

  async function logout() {
    const res = await axios.post(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/logout`)
    if(res.status = 200) {
      setIsLogged(false)
    }
  }

  // 取得に成功した場合の処理
  function successCallback(position:any){
    // 緯度・経度を取得し画面に表示
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    setCurrentCenter({lat: latitude, lng: longitude})
    setCenter({lat: latitude, lng: longitude})
    map?.setCenter({
      lat: latitude,
      lng: longitude
    })
  };

  function onDragEnd() {
    if(map == null) {
      return
    }

    var lat = map.getCenter()!.lat()
    var lng = map.getCenter()!.lng()

    map.setCenter({lat:lat, lng:lng})
  }

  function selectMarker(marker:TrackMarker) {
    setCenter({lat: marker.point.lat, lng: marker.point.lng})
    setSelectedMarker(marker)
  }

  function toCurrent() {
    if(map == null) {
        return
    }
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback)
    map.panTo({lat:current_center.lat, lng:current_center.lng})
  }

  // 取得に失敗した場合の処理
  function errorCallback(error:any){
    alert("位置情報が取得できませんでした");
  };

  const searchLocation = (lat: number, lng: number) => {
    const params = {
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
    }
    const tmpMarkers:Array<TrackMarker> = []

    axios.post(`/api/location/search`, params).then((response) => {
      response.data.locations.forEach((location: Location) => {
        const tmpMarker: TrackMarker = {
            id: location.id,
            track_name: location.track_name,
            artist_name: location.artist_name,
            point: {
                lat: location.x,
                lng: location.y,
            },
            url: location.thumbnail,
            preview_url: location.preview_url,
        }
        tmpMarkers.push(tmpMarker)
      })

      setMarkers(tmpMarkers)
    })
  }

  if(state == '') {
    axios.get(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/token`).then((response) => {
      setState(response.data.state)
    })
  }

  if(!isLoaded || state == '') {
    return (
      <></>
    )
  }

  const params = new URLSearchParams();
  params.append('client_id', process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '');
  params.append('response_type', 'code');
  params.append('redirect_uri', process.env.NEXT_PUBLIC_RETURN_TO || '');
  params.append('scope', 'user-read-private user-read-email');
  params.append('state', state);
  params.append('show_dialog', 'true');

  const url = `https://accounts.spotify.com/authorize?${params.toString()}`

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-12 py-4">
      <div className="flex items-center justify-between w-full mb-3">
        <div className='flex items-center justify-start'>
          <a className='font-serif text-4xl' href="/">Locatify</a>
          <a className='m-4 font-serif text-xl' href="/about">
            <img src="/help.svg" width={24} alt="" />
          </a>
        </div>
        <div className="max-w-5xl items-center justify-between font-mono text-sm flex">
            { isLogged && <>
                <a href={`/${userId}`}>
                    <button type='button' className='bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-2 rounded'>
                      <img src="/person.svg" width={24} alt="" />
                    </button>
                </a> 
                <a className='ml-3' href="/post">
                    <button type='button' className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded'>
                      <img src="/plus.svg" width={24} alt="" />
                    </button>
                </a> 
              </>
            }
            { isLogged ? 
                <button type='button' onClick={logout} className='bg-red-500 hover:bg-red-700 text-white py-2 px-2 font-bold rounded ml-3'>
                  <img src="/logout.svg" width={24} alt="" />
                </button>
                : 
                <a href={url}>
                  <button type='button' className='bg-green-500 hover:bg-green-700 text-black font-bold py-2 px-4 rounded ml-3'>Sign in with Spotify</button>
                </a>
            }
        </div>
      </div>

      <div className="lg:flex w-full h-screen">
        <div className="flex flex-col items-center justify-center lg:w-1/2 h-half-screen">
          <div className='flex items-center justify-between w-full'>
            <div className='flex items-center my-3'>
              <button onClick={() => {searchLocation(current_center.lat, current_center.lng)}}>
                <img src="/search.svg" alt="" width={24} />
              </button>
              <span className='ml-3'>Area</span>
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

            <button className='bg-green-500 rounded-full p-2' onClick={() => toCurrent()}>
                <img src="/near.svg" alt="" width={24} />
            </button>

          </div>

          <GoogleMap 
            mapContainerStyle={containerStyle} 
            center={center} 
            onLoad={map=>init(map)}
            zoom={zoom}
            onDragEnd={onDragEnd}
          >
            {center.lat != 0 && <Marker 
                position={current_center} 
                label=''
                icon={{
                  url: '/me.svg',
                  scaledSize: new google.maps.Size(40,40)
                }}
            />}

            {markers.map((marker:TrackMarker) => (
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

        <div className="flex flex-col items-center justify-center w-full lg:w-1/2 m-3">
            {selected_marker != null && 
                <div className='flex flex-col items-center justify-center'>
                    <div className='w-4/5 flex items-center justify-start'>
                        <p className='text-4xl'>{selected_marker.track_name}</p>
                    </div>
                    <div className='w-4/5 flex items-center justify-end'>
                      <p>By: {selected_marker.artist_name}</p>
                    </div>
                    <img className='w-4/5' src={selected_marker.url} />
                    {selected_marker.preview_url != null && <audio className='w-full mt-3' controls src={selected_marker.preview_url}></audio>}
                </div>
            }
        </div>
      </div>
    </main>
  )
};
