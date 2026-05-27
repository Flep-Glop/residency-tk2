from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_session
from app.schemas.settings import ProfileCreate, ProfileUpdate, ProfileResponse, EditCodeVerify
from app.services.settings import SettingsService

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


def get_service(session: AsyncSession = Depends(get_session)) -> SettingsService:
    return SettingsService(session)


@router.get("/profiles", response_model=List[ProfileResponse])
async def list_profiles(service: SettingsService = Depends(get_service)):
    return await service.list_profiles()


@router.get("/profiles/active", response_model=Optional[ProfileResponse])
async def get_active_profile(service: SettingsService = Depends(get_service)):
    return await service.get_active_profile()


@router.post("/profiles", response_model=ProfileResponse, status_code=201)
@limiter.limit("10/minute")
async def create_profile(
    request: Request,
    data: ProfileCreate,
    service: SettingsService = Depends(get_service),
):
    try:
        return await service.create_profile(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/profiles/{profile_id}/verify")
@limiter.limit("20/minute")
async def verify_edit_code(
    request: Request,
    profile_id: int,
    data: EditCodeVerify,
    service: SettingsService = Depends(get_service),
):
    try:
        valid = await service.verify_edit_code(profile_id, data.edit_code)
        if not valid:
            raise HTTPException(status_code=403, detail="Incorrect edit code")
        return {"valid": True}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/profiles/{profile_id}", response_model=ProfileResponse)
@limiter.limit("20/minute")
async def update_profile(
    request: Request,
    profile_id: int,
    data: ProfileUpdate,
    service: SettingsService = Depends(get_service),
):
    try:
        return await service.update_profile(profile_id, data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))


@router.put("/profiles/{profile_id}/activate", response_model=ProfileResponse)
async def activate_profile(
    profile_id: int,
    service: SettingsService = Depends(get_service),
):
    try:
        return await service.activate_profile(profile_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/profiles/{profile_id}", status_code=204)
@limiter.limit("10/minute")
async def delete_profile(
    request: Request,
    profile_id: int,
    data: EditCodeVerify,
    service: SettingsService = Depends(get_service),
):
    try:
        await service.delete_profile(profile_id, data.edit_code)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
