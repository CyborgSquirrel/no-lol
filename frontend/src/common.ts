import { useQuery } from "@tanstack/react-query";
import axios from "axios";

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
