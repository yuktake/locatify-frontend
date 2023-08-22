import { useState } from 'react';
import axios from 'axios';

type ModalProps = {
  show: boolean,
  clicked_latitude: number,
  clicked_longitude: number,
  close: Function,
}

const ModalComponent = ({ show, clicked_latitude, clicked_longitude, close }: ModalProps) => {

    const [query, setQuery] = useState<string>('');
    const [tracks, setTracks] = useState([]);
    const [selected_track, setSelectedTrack] = useState<string>('');

    const searchTracksByKeyword = (q: string) => {
        setQuery(q);
        axios.get('/api/track/search?q='+q).then((response) => {
            setTracks(response.data.tracks)
        });
    }

    const postLocation = () => {
        if (selected_track == '') {
            alert('投稿する曲を設定してください')
            return
        }

        if (clicked_latitude == 0 || clicked_longitude == 0) {
            alert('投稿する場所をマップにセットしてください')
            return
        }
        
        const params = {
            lat: clicked_latitude.toString(),
            lng: clicked_longitude.toString(),
            mid: selected_track,
        };
        axios.post('/api/location/post', params)
        window.location.href = '/'
    }

  return (
    <>
      {show && (
        <div className="flex flex-col items-center justify-center h-screen w-full fixed inset-x-0 inset-y-0 bg-black z-10">
            <div className="relative z-20 bg-white opacity-100 justify-center h-5/6 w-5/6 text-black overflow-auto hidden-scrollbar">
                
                <div className='flex justify-between m-3'>
                    <input
                        className='bg-slate-200 search'
                        placeholder="Search Tracks"
                        onChange={(e) => { searchTracksByKeyword(e.target.value.replace(/　/g, ' ')) }}
                    />
                    <button className='close' onClick={() => close()}>✖︎</button>
                </div>

                <div className='flex flex-col items-center justify-center m-3'>
                    {tracks.map((track:any) => (
                        <div key={track.id} className={selected_track == track.id ? "my-5 bg-amber-300 w-full flex flex-col items-center justify-center" : "my-5 w-full flex flex-col items-center justify-center"}>
                            <p>{track.name}</p>
                            <img
                            className="my-2"
                            src={track.album.images[0].url}
                            width={180}
                            height={37}
                            alt='album_img'
                            onClick={() => setSelectedTrack(track.id)}
                            />
                            {track.preview_url != null && <audio controls src={track.preview_url}></audio>}
                            <span>--------</span>
                        </div>
                    ))}
                </div>
                <button onClick={() => {postLocation()}} className='post bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>POST</button>
            </div>
        </div>
      )}
    </>
  )
}

export default ModalComponent