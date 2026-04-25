document.addEventListener('DOMContentLoaded', () => {

    // スクロール時のナビゲーションバーのスタイル変更
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // スクロールフェードインアニメーション
    const fadeElements = document.querySelectorAll('.fade-in');
    
    const checkFade = () => {
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (elementTop < windowHeight * 0.85) {
                element.classList.add('visible');
            }
        });
    };

    window.addEventListener('scroll', checkFade);
    checkFade(); // 初期ロード時にも実行

    // フォームの送信処理
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 送信ボタンを無効化して連打防止
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = '送信中...';

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            message: document.getElementById('message').value
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                formMessage.textContent = 'お問い合わせを受け付けました。担当者よりご連絡いたします。';
                formMessage.className = 'success';
                contactForm.reset();
            } else {
                throw new Error(data.detail || '送信に失敗しました');
            }
        } catch (error) {
            formMessage.textContent = 'エラーが発生しました: ' + error.message;
            formMessage.className = 'error';
        } finally {
            formMessage.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = '送信する';
        }
    });

});
