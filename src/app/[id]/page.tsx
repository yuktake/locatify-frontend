import axios from 'axios';
import { PostComponent, PostProps } from '@/components/post';
import type { Metadata, ResolvingMetadata } from 'next'

async function getLocation(id:string) {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/location/${id}`)
    if(response.data.status == 404) {
        window.location.href = '/'
    }
    const location = response.data.location

    return location
}

export default async function PostPage({ params: { id }, }: {params: { id: string };}){

    const location = await getLocation(id);

    return <PostComponent location={location} />;
};

export async function generateMetadata(
    { params: { id }, }: {params: { id: string };},
    parent?: ResolvingMetadata
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