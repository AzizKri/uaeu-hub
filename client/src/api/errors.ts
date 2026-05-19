export type ApiMutationResult = {
    status: number;
    message?: string;
    filename?: string;
};

type ApiErrorBody = {
    message?: unknown;
    errors?: Array<{
        message?: unknown;
    }>;
};

const genericMessages = new Set([
    "an error occurred. please try again.",
    "internal server error",
    "something went wrong",
    "something went wrong, please try again",
    "something went wrong. please try again.",
    "unauthorized",
]);

function cleanMessage(message: unknown) {
    return typeof message === "string" ? message.trim() : "";
}

function isSpecificMessage(message: string) {
    return message.length > 0 && !genericMessages.has(message.toLowerCase());
}

function parseJsonErrorBody(text: string): ApiErrorBody | null {
    try {
        const parsed = JSON.parse(text) as ApiErrorBody;
        return typeof parsed === "object" && parsed !== null ? parsed : null;
    } catch {
        return null;
    }
}

function getMessageFromBody(body: ApiErrorBody) {
    const validationMessages =
        body.errors
            ?.map((error) => cleanMessage(error.message))
            .filter(isSpecificMessage) ?? [];

    if (validationMessages.length > 0) {
        return validationMessages.join("\n");
    }

    const message = cleanMessage(body.message);
    return isSpecificMessage(message) ? message : "";
}

export async function getResponseErrorMessage(
    response: Response,
    fallbackMessage: string,
) {
    const text = cleanMessage(await response.text());
    const contentType = response.headers.get("content-type") ?? "";

    if (text.length === 0) {
        return fallbackMessage;
    }

    if (contentType.includes("application/json") || text.startsWith("{")) {
        const body = parseJsonErrorBody(text);
        if (body) {
            const bodyMessage = getMessageFromBody(body);
            if (bodyMessage) {
                return bodyMessage;
            }
        }
    }

    return isSpecificMessage(text) ? text : fallbackMessage;
}

export async function toApiMutationResult(
    response: Response,
    fallbackMessage: string,
): Promise<ApiMutationResult> {
    if (response.ok) {
        return { status: response.status };
    }

    return {
        status: response.status,
        message: await getResponseErrorMessage(response, fallbackMessage),
    };
}

export function getRequestFailureMessage(actionLabel: string, error: unknown) {
    const message = error instanceof Error ? cleanMessage(error.message) : "";

    if (
        message &&
        isSpecificMessage(message) &&
        !/fetch|network|load failed/i.test(message)
    ) {
        return `Could not ${actionLabel}: ${message}`;
    }

    return `Could not ${actionLabel} because the server could not be reached. Check your connection and try again.`;
}
