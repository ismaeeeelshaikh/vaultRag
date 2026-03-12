from sqlalchemy import Column, Integer, String, LargeBinary, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    filename = Column(String, nullable=False)
    file_extension = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_content = Column(LargeBinary, nullable=False)
    uploaded_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="documents")
