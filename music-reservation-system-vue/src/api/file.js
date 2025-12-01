import request from '@/utils/request';

// 文件上传API
const fileApi = {
    // 上传文件
    uploadFile(data) {
        return request.post('/upload', data);
    }
};

export { fileApi };

