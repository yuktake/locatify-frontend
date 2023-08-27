import { redirect } from 'next/navigation';
import { cookies } from "next/headers";
import { NextResponse } from 'next/server';

export async function GET(req:any,res:any) {
    const cookie = cookies()

    const state = Math.random().toString(32).substring(2)
    cookie.set({
        name: 'state',
        value: state,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
    })

    return NextResponse.json({ state: state });
}