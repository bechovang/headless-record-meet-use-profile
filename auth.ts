import { chromium } from 'playwright';
import path from 'path';

async function auth() {
    const userDataDir = path.join(process.cwd(), 'user_data');
    console.log(`\n======================================================`);
    console.log(`Đang mở Chromium với profile lưu tại: ${userDataDir}`);
    console.log(`Vui lòng đăng nhập tài khoản Google của bạn trong cửa sổ vừa hiện ra.`);
    console.log(`Sau khi đăng nhập xong, hãy đóng cửa sổ trình duyệt để hoàn tất!`);
    console.log(`======================================================\n`);

    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        viewport: null, // Mở toàn màn hình tự nhiên
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--start-maximized'
        ],
        ignoreDefaultArgs: ['--enable-automation']
    });

    let page = context.pages()[0];
    if (!page) {
        page = await context.newPage();
    }

    console.log('Đang chuyển hướng tới https://accounts.google.com/ ...');
    await page.goto('https://accounts.google.com/', { waitUntil: 'load' }).catch((e) => {
        console.log('Chuyển hướng gặp lỗi nhỏ, nhưng trang vẫn có thể thao tác được:', e.message);
    });

    console.log('Trình duyệt đang chờ bạn đăng nhập. Sau khi xong, hãy ĐÓNG TRÌNH DUYỆT.');

    // Chờ cho đến khi tất cả các page đóng hoặc context đóng
    await new Promise((resolve) => {
        context.on('close', resolve);
        const checkInterval = setInterval(() => {
            if (context.pages().length === 0) {
                clearInterval(checkInterval);
                resolve(null);
            }
        }, 1000);
    });

    console.log('\n[THÀNH CÔNG] Đã lưu profile Google đăng nhập vào thư mục ./user_data!');
    console.log('Từ bây giờ bạn có thể chạy bot ghi hình với profile này.');
    process.exit(0);
}

auth().catch((err) => {
    console.error('Lỗi:', err);
    process.exit(1);
});
