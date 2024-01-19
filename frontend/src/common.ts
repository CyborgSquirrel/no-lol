import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { User } from "./models/User";
import { BACKEND_API_URL } from "./constants";

export interface PendingFriendshipNotification {
    kind: "pending_friendship",
    content: {
        id: number,
        name: string,
    },
}

export interface PendingBuddyshipNotification {
    kind: "pending_buddyship",
    content: {
        id: number,
        name: string,
    }
}

export type Notification = PendingFriendshipNotification|PendingBuddyshipNotification;

export function useNotificationsQuery(userId: string) {
    const requestListQuery = useQuery<Notification[]>({
        queryKey: ['notificationList', userId],
        initialData: [],
        queryFn: async () => {
            const response = await axios.get(`user/by-id/${userId}/notifications`);
            if (response.status != 200) {
                throw "bad status";
            }

            return response.data;
        }
    });
    return requestListQuery;
}

export function useBuddyQuery(userId: string) {
    return useQuery<User>({
        queryKey: ['buddyData', userId],
        queryFn: async () => {
            try {
                const response = await axios.get(`/user/by-id/${userId}/buddy`);
                if (response.status === 200) {
                    const data = response.data;
                    data.icon = `${BACKEND_API_URL}/icon/by-id/${data.profile.icon_id}`;
                    return data;
                } else {
                    return null;
                }
            } catch (error){
                // @ts-ignore
                if(error.response.status === 404){
                    return null;
                }
            }
        }
    });
}
