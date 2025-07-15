const bcrypt = require('bcrypt');

const passwordToHash = process.argv[2]; // Lấy mật khẩu từ dòng lệnh
const saltRounds = 12;

if (!passwordToHash) {
    console.error('⚠️ Vui lòng truyền mật khẩu cần hash. VD: node hashedpassword.js matkhau123');
    process.exit(1);
}

bcrypt.hash(passwordToHash, saltRounds).then(hash => {
    console.log(`✅ Mật khẩu hash được:\n${hash}`);
}).catch(err => {
    console.error('❌ Lỗi hash mật khẩu:', err);
});

//VD: node .\hashedpassword.js hashedpassword123
// haiphongduong69@gmail.com 12345678
