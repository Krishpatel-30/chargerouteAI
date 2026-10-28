from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.models.report import CommunityReport
from app.schemas.report import CommunityReportResponse

router = APIRouter()


@router.get("/user", response_model=List[CommunityReportResponse])
async def get_my_reports(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(CommunityReport)
        .where(CommunityReport.user_id == current_user.id)
        .order_by(desc(CommunityReport.created_at))
    )
    res = await db.execute(stmt)
    reports = res.scalars().all()
    return [CommunityReportResponse.model_validate(r) for r in reports]
