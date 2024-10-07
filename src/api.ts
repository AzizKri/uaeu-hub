const base = "https://api.talente.dev/v1"

export async function getUserByUsername(username: string) {
    const request = await fetch(base + `/users/get/${username}`)
    return await request.json();
}

export async function getLatestPosts(amount: number) {
    const request = await fetch(base + `/posts/get/latest/${amount}`)
    return await request.json();
}