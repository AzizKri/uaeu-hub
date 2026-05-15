export const COMMUNITY_NAME_MIN_LENGTH = 3;
export const COMMUNITY_NAME_MAX_LENGTH = 32;
export const COMMUNITY_DESCRIPTION_MAX_LENGTH = 1024;

export function getCommunityNameError(name: string) {
    const trimmedName = name.trim();

    if (trimmedName.length === 0) {
        return "Community name cannot be empty";
    }

    if (trimmedName.length < COMMUNITY_NAME_MIN_LENGTH) {
        return "Community name must be at least 3 characters long";
    }

    if (trimmedName.length > COMMUNITY_NAME_MAX_LENGTH) {
        return "Community name must be at most 32 characters long";
    }

    return "";
}

export function getCommunityDescriptionError(description: string) {
    const trimmedDescription = description.trim();

    if (trimmedDescription.length === 0) {
        return "Community description cannot be empty";
    }

    if (description.length > COMMUNITY_DESCRIPTION_MAX_LENGTH) {
        return "Community description must be at most 1024 characters long";
    }

    return "";
}
