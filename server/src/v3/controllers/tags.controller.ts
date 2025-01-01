import { Context } from 'hono';

export async function getTags(c: Context) {
    const env: Env = c.env;
    // Get all tags
    const tags = await env.DB.prepare('SELECT * FROM tag').all<TagRow>();
    return c.json(tags.results, 200);
}

export async function getOrCreateTags(c: Context, internal: boolean = false) {
    const env: Env = c.env;

    // Define variables
    let tags;
    let tagNames: string[];

    // Check if internal
    if (internal) {
        tagNames = c.get('tags');
    } else {
        // Outside call, parse the body
        const formData = await c.req.parseBody();
        tags = formData['tags'] as string;

        // Check if tags are empty
        if (!tags) {
            return c.text('No tags provided', 400);
        }

        // Convert to array
        tagNames = tags.split(',').map((tag: string) => tag.trim());
    }

    // Check if tags are empty
    if (tagNames.length === 0) {
        return c.text('Tags cannot be empty', 400);
    }

    // Create a promise for each tag then return the tag IDs
    const tagIds = await Promise.all(tagNames.map(async (name) => {
        // Get the tag
        const tag = await env.DB.prepare(
            `SELECT id
             FROM tag
             WHERE name = ?`
        ).bind(name).first<TagRow>();

        // Return the tag ID if it exists
        if (tag) {
            return tag.id;
        }

        // Create the tag and return it otherwise
        const tagId = await env.DB.prepare(`
            INSERT INTO tag (name)
            VALUES (?)
            RETURNING id
        `).bind(name).first<TagRow>();

        return tagId!.id;
    }));

    // Return the tag IDs if it's internal
    if (internal) {
        return tagIds;
    }
    // Otherwise, return the tag IDs as JSON
    return c.json(tagIds, 200);
}
