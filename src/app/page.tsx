"use client"

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const zoom = 13;

export default function Home(){
  const [query, setQuery] = useState<string>('');
  const [tracks, setTracks] = useState([]);
  const [markers, setMarkers] = useState<any>([]);
  const [selected_track, setSelectedTrack] = useState<string>('');

  const [current_latitude, setCurrentLatitude] = useState<number>(0);
  const [current_longitude, setCurrentLongitude] = useState<number>(0);

  const [center_latitude, setCenterLatitude] = useState<number>(0);
  const [center_longitude, setCenterLongitude] = useState<number>(0);

  const [clicked_latitude, setClickedLatitude] = useState<number>(0);
  const [clicked_longitude, setClickedLongitude] = useState<number>(0);

  const [size, setSize] = useState<undefined | google.maps.Size>(undefined);
  const [radius, setRadius] = useState<string>('1');

  const [isLogged, setIsLogged] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string
  })

  const infoWindowOptions = {
    pixelOffset: size,
  };

  const center = {
    lat: center_latitude,
    lng: center_longitude,
  };

  // const current = {
  //   lat: current_latitude,
  //   lng: current_longitude,
  // }

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
    const res = await axios.get('http://localhost:3000/api/auth/check')
    console.log(res)
    if(res.data.status == 200) {
      setIsLogged(true)
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
  }

  function toCurrent() {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
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
    }
    const params = new URLSearchParams();
    params.append('lat', clicked_latitude.toString())
    params.append('lng', clicked_longitude.toString())
    params.append('mid', selected_track)
    params.append('uid', 'nista2411')
    axios.post('/api/location/post', params).then((response) => {
      console.log(response)
      alert('success')
    })
  }

  const searchLocation = (lat: number, lng: number) => {
    // windowサイズの初期化
    setSize(new window.google.maps.Size(0, -45))

    const params = new URLSearchParams();
    params.append('lat', lat.toString())
    params.append('lng', lng.toString())
    params.append('radius', radius.toString())

    const tmpMarkers:Array<any> = []
    axios.get(`/api/location/search?${params.toString()}`).then((response) => {
      response.data.locations.forEach((location:any) => {
        const tmpMarker: { [name: string]: any } = {};
        tmpMarker['id'] = location.id
        tmpMarker['point'] = {lat: location.x, lng: location.y}
        tmpMarker['url'] = 'https://i.scdn.co/image/ab67616d0000b273adcc90bbf8ffa384c25c4478'
        tmpMarkers.push(tmpMarker)
      })

      setMarkers(tmpMarkers)
    })
  }

  const params = new URLSearchParams();
  params.append('client_id', process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '');
  params.append('response_type', 'code');
  params.append('redirect_uri', process.env.NEXT_PUBLIC_RETURN_TO || '');
  params.append('scope', 'user-read-private');
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
        { isLogged ? <button>Logout</button> : <a href={url}>Sign in with Spotify</a> }

        <button onClick={() => {postLocation()}}>Post</button>
      </div>

      <div className="flex sm:w-full md:w-5/6 lg:w-full h-screen">
        <div className="flex flex-col items-start justify-start sm:w-full md:w-5/6 lg:w-1/2">
          <div className='flex items-center justify-between w-full'>
            <div className='my-3'>
              <span>半径</span>
              <select
                className='text-black'
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

            <button onClick={() => toCurrent()}>Current</button>

            <button onClick={() => {searchLocation(current_latitude,current_longitude)}}>Search</button>
          </div>

          <GoogleMap 
            mapContainerStyle={containerStyle} 
            center={center} 
            zoom={zoom} 
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
                position={center} 
                label=''
                icon={{
                  url: '/me.svg',
                  scaledSize: new google.maps.Size(40,40)
                }}
            />
            {markers.map((marker:any) => (
              <Marker 
                key={marker.id}
                position={marker.point} 
                label=''
                icon={{
                  url: marker.url,
                  scaledSize: new google.maps.Size(40,40)
                }}
              />
            ))}
            {markers.map((marker:any) => (
              <InfoWindow key={marker.id} position={marker.point} options={infoWindowOptions}>
                <div>
                  <h1>秋葉原オフィス</h1>
                </div>
              </InfoWindow>
            ))}
          </GoogleMap>
        </div>

        <div className="flex flex-col items-start justify-start sm:w-full md:w-5/6 lg:w-1/2 m-3">
          <input
              ref={inputRef}
              className='text-black'
              placeholder="Search Tracks"
              onChange={(e) => { searchTracksByKeyword(e.target.value.replace(/　/g, ' ')) }}
          />

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
};
