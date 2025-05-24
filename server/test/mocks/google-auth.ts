// Mock Google Auth Library
export const OAuth2Client = class {
    constructor() {
        // Mock constructor
    }

    setCredentials() {
        // Mock setCredentials
    }

    async verifyIdToken() {
        return {
            getPayload: () => ({
                email: 'test@example.com',
                name: 'Test User',
                picture: 'https://example.com/picture.jpg'
            })
        };
    }
};

export const GoogleAuth = class {
    constructor() {
        // Mock constructor
    }
}; 