type CloudUserInfo = {
    details: {
        name: string;
        email: string;
        pictureUrl: string;
    },
    subscription: {
        isPremium: boolean;
        status?: string; // "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "paused" | "trialing" | "unpaid"
        period_end?: number,
	    cancel_at_period_end?: boolean
    },
    usage: {
        limit: number;
        remaining: number;
        lastUpdated: string | null;
    },
    options: {
        providerSelection: ProviderDataRetention;
        showProprietaryModels: boolean;
    }
};