from fastapi import FastAPI, Depends, Query, HTTPException, Response, Request, File, UploadFile, Form
from fastapi.responses import StreamingResponse
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert
import database
import models
import os
from datetime import datetime, timedelta
from urllib.parse import quote

app = FastAPI(title="SDR Live API")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def root():
    return {"message": "SDR Live API is running"}

@app.get("/recordings")
async def get_recordings(
    date: str = Query(None),
    time: str = Query(None),
    limit: int = Query(None),
    db: AsyncSession = Depends(database.get_db)
):
    query = select(models.Recording)
    if date:
        try:
            dt = datetime.strptime(date, "%Y-%m-%d")
            if time:
                t = datetime.strptime(time, "%H:%M").time()
                dt = dt.replace(hour=t.hour, minute=t.minute)
                dt_end = dt + timedelta(minutes=59, seconds=59)
            else:
                dt_end = dt + timedelta(days=1)
            query = query.where(models.Recording.timestamp >= dt, models.Recording.timestamp < dt_end)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid date/time format")
    query = query.order_by(models.Recording.timestamp.desc())
    if limit:
        query = query.limit(limit)
    result = await db.execute(query)
    recordings = result.scalars().all()
    return [
        {
            "id": r.id,
            "timestamp": r.timestamp,
            "duration": r.duration,
            "source": r.source,
            "url": r.url
        } for r in recordings
    ]

@app.get("/stream/{recording_id}")
async def stream_recording(recording_id: int, download: int = 0, db: AsyncSession = Depends(database.get_db)):
    result = await db.execute(select(models.Recording).where(models.Recording.id == recording_id))
    rec = result.scalar_one_or_none()
    if not rec:
        raise HTTPException(status_code=404, detail="Recording not found")
    file_path = rec.url  # Assume local file path for now
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    def iterfile():
        with open(file_path, mode="rb") as file_like:
            yield from file_like
    headers = {}
    if download:
        filename = os.path.basename(file_path)
        headers["Content-Disposition"] = f"attachment; filename*=UTF-8''{quote(filename)}"
    return StreamingResponse(iterfile(), media_type="audio/mpeg", headers=headers)

@app.get("/stream/live")
async def stream_live(db: AsyncSession = Depends(database.get_db)):
    result = await db.execute(select(models.Recording).order_by(models.Recording.timestamp.desc()))
    rec = result.scalars().first()
    if not rec:
        raise HTTPException(status_code=404, detail="No live audio available")
    file_path = rec.url
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Audio file not found")
    def iterfile():
        with open(file_path, mode="rb") as file_like:
            yield from file_like
    return StreamingResponse(iterfile(), media_type="audio/mpeg")

@app.post("/upload")
async def upload_audio(
    file: UploadFile = File(...),
    duration: int = Form(...),
    timestamp: str = Form(None),
    source: str = Form(None),
    db: AsyncSession = Depends(database.get_db)
):
    # Save file
    filename = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    # Parse timestamp
    if timestamp:
        try:
            ts = datetime.fromisoformat(timestamp)
        except Exception:
            ts = datetime.utcnow()
    else:
        ts = datetime.utcnow()
    # Insert into DB
    stmt = insert(models.Recording).values(
        timestamp=ts,
        duration=duration,
        source=source,
        url=file_path
    ).returning(models.Recording.id, models.Recording.timestamp, models.Recording.duration, models.Recording.source, models.Recording.url)
    result = await db.execute(stmt)
    await db.commit()
    rec = result.fetchone()
    return {
        "id": rec[0],
        "timestamp": rec[1],
        "duration": rec[2],
        "source": rec[3],
        "url": rec[4]
    } 