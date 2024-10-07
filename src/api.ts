const base = "https://api.talente.dev/v1"

export async function getUserByUsername(username: string) {
    const request = await fetch(base + `/users/get/${username}`)
    return await request.json();
}