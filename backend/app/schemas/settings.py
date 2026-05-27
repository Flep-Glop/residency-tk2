from pydantic import BaseModel, Field, model_validator
from typing import Any, Dict, List, Optional
from datetime import datetime

from app.models.settings import (
    DEFAULT_VISIBLE_MODULES,
    DEFAULT_FACILITY_DEFAULTS,
    DEFAULT_MODULE_PRESETS,
)


class ProfileCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    edit_code: str = Field(..., min_length=1, max_length=64)
    physicians: List[str] = Field(default_factory=list)
    physicists: List[str] = Field(default_factory=list)
    visible_modules: Dict[str, bool] = Field(default_factory=lambda: DEFAULT_VISIBLE_MODULES.copy())
    facility_defaults: Dict[str, Any] = Field(default_factory=lambda: DEFAULT_FACILITY_DEFAULTS.copy())
    module_presets: Dict[str, Any] = Field(default_factory=lambda: DEFAULT_MODULE_PRESETS.copy())
    icon: Optional[str] = None


class ProfileUpdate(BaseModel):
    edit_code: str = Field(..., min_length=1, max_length=64)
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    physicians: Optional[List[str]] = None
    physicists: Optional[List[str]] = None
    visible_modules: Optional[Dict[str, bool]] = None
    facility_defaults: Optional[Dict[str, Any]] = None
    module_presets: Optional[Dict[str, Any]] = None
    icon: Optional[str] = None


class EditCodeVerify(BaseModel):
    edit_code: str = Field(..., min_length=1, max_length=64)


MAX_ICON_BYTES = 500 * 1024  # 500 KB


class ProfileResponse(BaseModel):
    id: int
    name: str
    physicians: List[str]
    physicists: List[str]
    visible_modules: Optional[Dict[str, bool]] = None
    facility_defaults: Optional[Dict[str, Any]] = None
    module_presets: Optional[Dict[str, Any]] = None
    icon: Optional[str] = None
    is_active: bool
    is_system: bool = False
    has_edit_code: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def compute_has_edit_code(cls, data):
        if hasattr(data, "edit_code_hash"):
            obj = data
            raw = {
                "id": obj.id,
                "name": obj.name,
                "physicians": obj.physicians,
                "physicists": obj.physicists,
                "visible_modules": obj.visible_modules,
                "facility_defaults": obj.facility_defaults,
                "module_presets": obj.module_presets,
                "icon": obj.icon,
                "is_active": obj.is_active,
                "is_system": obj.is_system,
                "has_edit_code": bool(obj.edit_code_hash),
                "created_at": obj.created_at,
                "updated_at": obj.updated_at,
            }
            return raw
        if isinstance(data, dict):
            data["has_edit_code"] = bool(data.get("edit_code_hash"))
        return data

    @model_validator(mode="after")
    def fill_none_with_defaults(self):
        if not self.visible_modules:
            self.visible_modules = DEFAULT_VISIBLE_MODULES.copy()
        if not self.facility_defaults:
            self.facility_defaults = DEFAULT_FACILITY_DEFAULTS.copy()
        if not self.module_presets:
            self.module_presets = DEFAULT_MODULE_PRESETS.copy()
        return self
