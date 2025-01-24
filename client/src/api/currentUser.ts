const userBase = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/user';
const authBase = (import.meta.env.VITE_API_URL || 'https://api.uaeu.chat') + '/auth';

// This basically checks if there's a session key (Anon or normal user)
export async function isUser() {
    const request = await fetch(authBase + `/isUser`, { credentials: 'include' });
    return request.status === 200; // true if status is 200, otherwise false (401 Unauthorized or 500 Internal Server Error)
}

// Returns true if anon, false otherwise
export async function isAnon() {
    const request = await fetch(authBase + `/isAnon`, { credentials: 'include' });
    const data = await request.json();
    return data.anon;
}

// Returns current user data
export async function getCurrentUser() {
    return await fetch(userBase, { credentials: 'include' });
}

// Returns the like data for the current user
export async function getLikesCurrentUser(type: 'posts' | 'comments' | 'subcomments' = 'posts') {
    const request = await fetch(userBase + `/likes?type=${type}`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

// Returns the communities the current user is part of
export async function getCommunitiesCurrentUser() {
    const request = await fetch(userBase + `/communities`, { credentials: 'include' });
    return { status: request.status, data: await request.json() };
}

export async function editCurrentUser({ displayname, bio, pfp }: { displayname?: string, bio?: string, pfp?: string }) {
    const request = await fetch(userBase, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ displayname, bio, pfp }),
        credentials: 'include'
    });
    return { status: request.status, data: await request.json() };
}
