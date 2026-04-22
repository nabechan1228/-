import smtplib
import ssl
import logging
from email.message import EmailMessage
from email.utils import formataddr
from config import get_settings

logger = logging.getLogger("housemaker.email")

def send_auto_reply_email(to_email: str, name: str):
    """
    お問い合わせ送信者に対する自動返信メールを送信する
    SMTP設定がない場合はログ出力（テストモード）として動作する
    """
    settings = get_settings()
    
    subject = "【渡部工務店】お問い合わせを受け付けました"
    body = f"""{name} 様

この度は渡部工務店にお問い合わせいただき、誠にありがとうございます。
以下の内容でお問い合わせを受け付けました。

担当者が内容を確認次第、折り返しご連絡させていただきます。
今しばらくお待ちくださいますようお願い申し上げます。

※本メールは自動配信されております。
お心当たりのない場合は、破棄していただきますようお願いいたします。

--------------------------------------------------
渡部工務店
〒998-0000 山形県酒田市テスト町1-2-3
TEL: 0234-XX-XXXX
URL: {settings.site_url}
--------------------------------------------------
"""

    if not settings.smtp_server:
        # テストモード: コンソールに出力
        logger.info("========== [TEST MODE] EMAIL SENT ==========")
        logger.info(f"To: {to_email}")
        logger.info(f"Subject: {subject}")
        logger.info(body)
        logger.info("==============================================")
        return

    # 本番モード: SMTPサーバー経由で送信
    msg = EmailMessage()
    msg.set_content(body)
    msg["Subject"] = subject
    msg["From"] = formataddr((settings.smtp_from_name, settings.smtp_from_email))
    msg["To"] = to_email

    try:
        # TLS証明書を検証するセキュアなコンテキストを使用
        ssl_context = ssl.create_default_context()
        with smtplib.SMTP(settings.smtp_server, settings.smtp_port) as server:
            server.starttls(context=ssl_context)
            if settings.smtp_user and settings.smtp_password:
                server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
            logger.info(f"自動返信メールを送信しました: {to_email}")
    except Exception as e:
        logger.error(f"メール送信に失敗しました: {e}")
