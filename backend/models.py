from sqlalchemy import Column, Integer, String, TIMESTAMP, Text
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Recording(Base):
    __tablename__ = "recordings"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(TIMESTAMP, nullable=False)
    duration = Column(Integer, nullable=False)
    source = Column(String(255))
    url = Column(Text, nullable=False) 