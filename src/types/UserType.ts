export interface UserProfileResponse {
  user: {
    userid: number;
    username: string;
    name: string;
    phone: string;
    api_id: number;
    api_hash: string;
    role: number;
    telegram_auth: number;
  };
}
