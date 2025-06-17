// Author: TrungQuanDev: https://youtube.com/@trungquandev
import axios from 'axios';
import { toast } from 'react-toastify'

// Khởi tạo một đối tượng Axios (authorizedAxiosInstance) mục đích để custom và cấu hình chung cho dự án
let authorizedAxiosInstance = axios.create()

// Thời gian chờ tối đa của 1 request là 10 phút
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10

// withCredentials: Sẽ cho phép axios tự động đính kèm và gửi cookie trong mỗi request lên BE
// phục vụ trường hợp nếu chúng ta sử dụng JWT token (refresh & access) theo cơ chế httpOnly Cookie
authorizedAxiosInstance.defaults.withCredentials = true

/**
 * Cấu hình Interceptor (Bộ đánh chặn vào giữa mọi request và response)
 * Để xử lý các trường hợp như:
 * - Thêm token vào header của request 
 * - Xử lý lỗi response từ server
 * - Thực hiện các hành động khác trước khi gửi request hoặc sau khi nhận response
 * * Ví dụ: Thêm token vào header của request
 * * Lưu ý: Interceptor sẽ được gọi trước khi request được gửi đi
 * https://axios-http.com/docs/interceptors
 */

//Add a request interceptor
authorizedAxiosInstance.interceptors.request.use((config) => {
    // Lấy accessToken từ localStorage và đnhs kèm vào header của request
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
        /**
         * Cần thêm "Bearer" vì chúng ta nên tuân thủ theo tiêu chuẩn OAuth 2.0 trong việc xác định loại token đang sử dụng
         * Bearer là định nghĩa loại token dành cho việc xác thực và ủy quyền, tham khảo các loại token khác như: Basic token, Digest token, OAy=uth token, ...vv
         */
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
}, (error) => {
    //Do something with request error
    return Promise.reject(error);
})

//Add a response interceptor
authorizedAxiosInstance.interceptors.response.use((response) => {
    // Any status code that line within the range of 2xx cause this function to trigger
    /**
     * Mọi mã http status code nằm trong khoảng 200 - 299 sẽ là response thành công
     */
    // Do something with response data
    return response;
}, (error) => {
    /**
     * Mọi mã http status code nằm ngoài khoảng 200 - 299 sẽ là error và rơi vào đây
     */
    // Do something with response error
    /**
     * Xử lý tập trung phần hiển thị thông báo lỗi trả về từ mọi API ở đây (viết code một lần: Clean Code)
     * console.log(error) ra là sẽ thấy cấu trúc data dẫn tới message lỗi như dưới
     * Dùng toastify để hiển thị bất kể mọi mã lỗi lên màn hình - Ngoại trừ mã 410 - GONE phục vụ việc tự động refresh lại token
     */
    if (error.response?.status !== 410) {
        toast.error(error.response?.data?.message || error?.message)
    }

    return Promise.reject(error);
})

export default authorizedAxiosInstance