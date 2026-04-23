export interface User { 
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
    country_code: string | null;
    phone: string | null;
    created_at: string;
    updated_at: string;
}