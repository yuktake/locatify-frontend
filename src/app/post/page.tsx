"use client"

import { useEffect, useState } from 'react';
import axios from 'axios';
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import ModalComponent from '@/components/modal';

const containerStyle = {
    width: "100%",
    height: "100vh",
};

const zoom = 13;

export default function Post(){

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

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const close = () => {
        setIsOpen(false)
    }

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
        const res = await axios.get(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/auth/check`)
    
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
    }

    function showModal() {
        setIsOpen(true)

        if(isOpen) {
            return;
        }
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

    if(!isLoaded) {
        return (
            <></>
        )
    }

    return (
        <main className="min-h-screen px-12 py-4">
            <div className='flex flex-col items-center justify-center'>
                <div className="flex items-center justify-start w-full">
                    <a className='font-serif text-4xl' href="/">Locatify</a>
                </div>
                <div className="flex w-full h-screen">
                    <div className="flex flex-col items-start justify-start w-full">
                        <div className='flex items-center justify-between w-full my-2'>
                            {clicked_latitude != 0 && clicked_longitude != 0 && 
                                <button type='button' onClick={showModal} className='mx-2 bg-green-500 hover:bg-green-700 font-bold py-2 px-2 rounded'>
                                    <img width={24} src="/music.svg"/>
                                </button>
                            }
                            <div className="ml-2 flex items-center justify-center w-full">
                                <span>Tap The Position Where You Want To Place The Song</span>
                            </div>
                            <button className='bg-green-500 rounded-full p-2' onClick={() => toCurrent()}>
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
                </div>
            </div>
            
            <ModalComponent 
                show={isOpen} 
                clicked_latitude={clicked_latitude} 
                clicked_longitude={clicked_longitude} 
                close={close}
            />


        </main>
    )
}