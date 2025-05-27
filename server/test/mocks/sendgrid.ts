// Mock SendGrid Mail
export default {
    setApiKey: () => {},
    send: async () => {
        return [
            {
                statusCode: 202,
                headers: {},
                body: ''
            },
            {}
        ];
    }
}; 