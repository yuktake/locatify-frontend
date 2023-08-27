import axios from 'axios';
import { PostComponent } from '@/components/post';
import type { Metadata, ResolvingMetadata } from 'next'
import { redirect } from 'next/navigation';

export default async function PostPage({ params: { id }, }: {params: { id: string };}){

    const location = await getLocation(id);

    return <PostComponent location={location} />;
};

async function getLocation(id:string) {
    // const response = await axios.get(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/location/${id}`)
    // if(response.data.status == 404) {
    //     redirect('/')
    // }
    // const location = response.data.location

    const location = {
      id: 28,
      uid: 'aaa',
      mid: 'aaa',
      track_name: 'aaa',
      artist_name: 'aaa',
      point: 'aaa',
      x: 1,
      y: 2,
      thumbnail: 'aaa',
      preview_url: 'aaa',
      created_at: 'aaa',
      updated_at: 'aaa'
    }

    return location
}

export async function generateMetadata(
    { params: { id }, }: {params: { id: string };}
): Promise<Metadata> {
    
    const location = await getLocation(id);

    return {
      openGraph: {
        images: [location.thumbnail],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Locatify',
        description: 'I am listening to...',
        images: [location.thumbnail]
      }
    }
  }