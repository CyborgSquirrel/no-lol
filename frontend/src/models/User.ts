export interface User {
    id: number,
    name: string,
    profile: {
        balance: number,
        hours_played: number,
        icon_id: number,
        last_match_end: number,
        region: string
    }
    icon?: string
}