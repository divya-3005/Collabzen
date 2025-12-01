import api from './axios';

export const getComments = (taskId) => api.get(`/comments/${taskId}`);
export const createComment = (data) => api.post('/comments', data);
