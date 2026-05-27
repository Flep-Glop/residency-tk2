import hashlib
import secrets

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.settings import ClinicProfile
from app.schemas.settings import ProfileCreate, ProfileUpdate, ProfileResponse, MAX_ICON_BYTES


def _hash_code(code: str, salt: str | None = None) -> str:
    if salt is None:
        salt = secrets.token_hex(16)
    digest = hashlib.sha256(f"{salt}:{code}".encode()).hexdigest()
    return f"{salt}${digest}"


def _verify_code(code: str, stored_hash: str) -> bool:
    salt = stored_hash.split("$")[0]
    return _hash_code(code, salt) == stored_hash


class SettingsService:
    def __init__(self, session: AsyncSession):
        self.session = session

    @staticmethod
    def _validate_icon(icon: str | None) -> None:
        if icon and len(icon.encode("utf-8")) > MAX_ICON_BYTES:
            raise ValueError(
                f"Icon exceeds maximum size of {MAX_ICON_BYTES // 1024} KB"
            )

    async def list_profiles(self) -> list[ProfileResponse]:
        result = await self.session.execute(
            select(ClinicProfile).order_by(ClinicProfile.name)
        )
        return [ProfileResponse.model_validate(p) for p in result.scalars().all()]

    async def get_active_profile(self) -> ProfileResponse | None:
        result = await self.session.execute(
            select(ClinicProfile).where(ClinicProfile.is_active == True).order_by(ClinicProfile.updated_at.desc())  # noqa: E712
        )
        active_profiles = result.scalars().all()
        if not active_profiles:
            return None
        if len(active_profiles) > 1:
            for extra in active_profiles[1:]:
                extra.is_active = False
            await self.session.commit()
        return ProfileResponse.model_validate(active_profiles[0])

    async def create_profile(self, data: ProfileCreate) -> ProfileResponse:
        self._validate_icon(data.icon)

        existing = await self.session.execute(select(ClinicProfile))
        has_profiles = existing.scalars().first() is not None

        profile = ClinicProfile(
            name=data.name,
            physicians=data.physicians,
            physicists=data.physicists,
            visible_modules=data.visible_modules,
            facility_defaults=data.facility_defaults,
            module_presets=data.module_presets,
            edit_code_hash=_hash_code(data.edit_code),
            is_active=not has_profiles,
        )
        self.session.add(profile)
        await self.session.commit()
        await self.session.refresh(profile)
        return ProfileResponse.model_validate(profile)

    async def verify_edit_code(self, profile_id: int, edit_code: str) -> bool:
        result = await self.session.execute(
            select(ClinicProfile).where(ClinicProfile.id == profile_id)
        )
        profile = result.scalar_one_or_none()
        if not profile:
            raise ValueError(f"Profile with id {profile_id} not found")
        if not profile.edit_code_hash:
            return True
        return _verify_code(edit_code, profile.edit_code_hash)

    async def update_profile(self, profile_id: int, data: ProfileUpdate) -> ProfileResponse:
        result = await self.session.execute(
            select(ClinicProfile).where(ClinicProfile.id == profile_id)
        )
        profile = result.scalar_one_or_none()
        if not profile:
            raise ValueError(f"Profile with id {profile_id} not found")
        if profile.is_system:
            raise ValueError("System profiles cannot be modified")
        if profile.edit_code_hash and not _verify_code(data.edit_code, profile.edit_code_hash):
            raise PermissionError("Incorrect edit code")

        self._validate_icon(data.icon)
        update_data = data.model_dump(exclude_unset=True, exclude={"edit_code"})
        for key, value in update_data.items():
            setattr(profile, key, value)

        await self.session.commit()
        await self.session.refresh(profile)
        return ProfileResponse.model_validate(profile)

    async def activate_profile(self, profile_id: int) -> ProfileResponse:
        await self.session.execute(
            update(ClinicProfile).values(is_active=False)
        )
        result = await self.session.execute(
            select(ClinicProfile).where(ClinicProfile.id == profile_id)
        )
        profile = result.scalar_one_or_none()
        if not profile:
            raise ValueError(f"Profile with id {profile_id} not found")

        profile.is_active = True
        await self.session.commit()
        await self.session.refresh(profile)
        return ProfileResponse.model_validate(profile)

    async def delete_profile(self, profile_id: int, edit_code: str | None = None) -> None:
        result = await self.session.execute(
            select(ClinicProfile).where(ClinicProfile.id == profile_id)
        )
        profile = result.scalar_one_or_none()
        if not profile:
            raise ValueError(f"Profile with id {profile_id} not found")
        if profile.is_system:
            raise ValueError("System profiles cannot be deleted")
        if profile.edit_code_hash:
            if not edit_code or not _verify_code(edit_code, profile.edit_code_hash):
                raise PermissionError("Incorrect edit code")

        await self.session.delete(profile)
        await self.session.commit()
