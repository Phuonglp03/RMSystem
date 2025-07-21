import axiosClient from "./axios.service";

const notificationAPI = {
    getNotifications: () => {
        return axiosClient.get('/api/notification');
    },

    markNotificationAsRead: (notificationId) => {
        return axiosClient.patch('/api/notification/read', { notificationId });
    },

    deleteNotification: (notificationId) => {
        return axiosClient.delete('/api/notification/delete', { data: { notificationId } });
    }
}

const notificationService = {
    getNotifications: async () => {
        try {
            const response = await notificationAPI.getNotifications();
            return response;
        } catch (error) {
            console.error('Lỗi trong notificationService:', error);
            throw error.response ? error.response.data : new Error('Error fetching notifications');
        }
    },

    markNotificationAsRead: async (notificationId) => {
        try {
            const response = await notificationAPI.markNotificationAsRead(notificationId);
            return response;
        } catch (error) {
            throw error.response ? error.response.data : new Error('Error marking notification as read');
        }
    },
    deleteNotification: async (notificationId) => {
        try {
            const response = await notificationAPI.deleteNotification(notificationId);
            return response;
        } catch (error) {
            throw error.response ? error.response.data : new Error('Error deleting notification');
        }
    }
}

export default notificationService