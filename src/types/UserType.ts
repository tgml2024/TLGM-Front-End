export interface UserProfileResponse {
  user: {
    userid: number;
    username: string;
    name: string | null;
    phone: string | null;
    api_id: number | null;
    api_hash: string | null;
    role: number;
    telegram_auth: number;
  };
}
