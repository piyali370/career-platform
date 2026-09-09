from sqlalchemy.orm import Session
import models

def create_notification(db: Session, user_id: int, message: str, link: str = None):
    notification = models.Notification(
        user_id=user_id,
        message=message,
        link=link,
    )
    db.add(notification)
    db.commit()