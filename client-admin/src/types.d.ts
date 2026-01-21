declare global {
    interface AdminUser {
        id: number;
        username: string;
        displayName: string;
        email: string;
        pfp?: string;
        isAdmin: boolean;
    }

    interface AdminStats {
        totalUsers: number;
        totalPosts: number;
        totalCommunities: number;
        pendingReports: number;
        pendingBugReports: number;
        pendingFeatureRequests: number;
    }

    interface TopCommunity {
        id: number;
        public_id: string;
        name: string;
        description: string;
        icon: string;
        member_count: number;
        created_at: number;
    }

    interface Report {
        id: number;
        reporter_id: number;
        reporter_username?: string;
        entity_id: number;
        entity_type: 'post' | 'comment' | 'subcomment' | 'community' | 'user';
        report_type: string;
        reason: string;
        resolved: boolean;
        created_at: number;
        entity?: ReportEntity;
    }

    interface ReportEntity {
        id: number;
        content?: string;
        author_username?: string;
        author_displayname?: string;
        name?: string;
        username?: string;
        attachment?: string;
        attachment_mime?: string;
    }

    interface BugReport {
        id: number;
        public_id: string;
        reporter_id: number;
        reporter_username?: string;
        description: string;
        screenshot?: string;
        status: 'pending' | 'reviewed' | 'resolved' | 'closed';
        created_at: number;
    }

    interface FeatureRequest {
        id: number;
        public_id: string;
        reporter_id: number;
        reporter_username?: string;
        description: string;
        screenshot?: string;
        status: 'pending' | 'reviewed' | 'resolved' | 'closed';
        created_at: number;
    }

    interface AdminAuthContextType {
        user: AdminUser | null;
        isLoading: boolean;
        login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
        logout: () => Promise<void>;
        isAuthenticated: boolean;
    }
}

export {};
