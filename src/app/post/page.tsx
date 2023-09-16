"use client"

import { useState } from 'react';
import axios from 'axios';
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import ModalComponent from '@/components/modal';

const containerStyle = {
    width: "100%",
    height: "100vh",
};

const zoom = 13;

export default function Post(){
    const [current_center, setCurrentCenter] = useState<any>({lat: 0, lng:0});
    const [clicked, setClicked] = useState<any>({lat: 0, lng:0});
    const [center, setCenter] = useState<any>({lat: 0, lng:0});

    const [map, setMap] = useState<any>(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string
    })

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const close = () => {
        setIsOpen(false)
    }

    function init(map: google.maps.Map) {
        setMap(map)
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback)
    }

    checkLoginApi()

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

        setCurrentCenter({lat: latitude, lng: longitude})
        setCenter({lat: latitude, lng: longitude})
        map?.setCenter({
            lat: latitude,
            lng: longitude
        })
    };

    function clickMap(e:any){
        setClicked({lat: e.latLng.lat(), lng:e.latLng.lng()})
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
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback)
        map.panTo({
            lat:current_center.lat, 
            lng:current_center.lng
        })
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
                            {clicked.lat != 0 && clicked.lng != 0 && 
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
                            onLoad={map=>init(map)}
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
                                position={current_center} 
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
                clicked={clicked} 
                close={close}
            />
        </main>
    )
}