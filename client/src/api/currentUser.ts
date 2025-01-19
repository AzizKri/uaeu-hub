import {base} from './api.ts'

// This basically checks if there's a session key (Anon or normal user)
export async function isUser() {
    const request = await fetch(base + `/auth/isUser`, { credentials: 'include' });
    return request.status === 200; // true if status is 200, otherwise false (401 Unauthorized or 500 Internal Server Error)
}

// Returns true if anon, false otherwise
export async function isAnon() {
    const request = await fetch(base + `/auth/isAnon`, { credentials: 'include' });
    const data = await request.json();
    return data.anon;
}

// Returns current user data
export async function getCurrentUser() {
    return await fetch(base + `/user`, { credentials: 'include' });
}

// Returns the like data for the current user
export async function getLikesCurrentUser(type: 'posts' | 'comments' | 'subcomments' = 'posts') {
    const request = await fetch(base + `/user/likes?type=${type}`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

// Returns the communities the current user is part of
export async function getCommunitiesCurrentUser() {
    const request = await fetch(base + `/user/communities`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

export async function editCurrentUser({ displayname, bio, pfp }: { displayname?: string, bio?: string, pfp?: string }) {
    const request = await fetch(base + `/user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ displayname, bio, pfp }),
        credentials: 'include'
    });
    return { status: request.status, data: await request.json() };
}
