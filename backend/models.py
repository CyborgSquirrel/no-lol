import json
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class ModelBase(DeclarativeBase):
    def to_dict(self):
        pass

    def to_json(self):
        return json.dumps(self.to_dict())


class User(ModelBase):
    __tablename__ = "User"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    profile: Mapped["Profile"] = relationship(back_populates="user")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "profile": self.profile.to_dict()
        }


class Profile(ModelBase):
    __tablename__ = "Profile"

    # NOTE(andreij): Why use riot_id+riot_region instead of puuid? Because
    # getting a summoner by puuid is not yet supported in cassiopeia[0].
    # [0]: https://github.com/meraki-analytics/cassiopeia/issues/441
    riot_id: Mapped[str] = mapped_column(nullable=False, primary_key=True)
    riot_region: Mapped[str] = mapped_column(nullable=False, primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("User.id"), nullable=False)
    user: Mapped["User"] = relationship(back_populates="profile")

    balance: Mapped[int] = mapped_column(default=0, nullable=False)
    hours_played: Mapped[int] = mapped_column(default=0, nullable=False)

    icon_id: Mapped[int] = mapped_column(ForeignKey("Icon.id"))
    icon: Mapped["Icon"] = relationship()

    last_match_updated: Mapped[datetime] = mapped_column(nullable=True)
    last_match_id: Mapped[int] = mapped_column(nullable=True)
    last_match_end: Mapped[datetime] = mapped_column(nullable=True)

    def to_dict(self):
        return {
            "riot_id": self.riot_id,
            "riot_region": self.riot_region,
            "user_id": self.user_id,
            "balance": self.balance,
            "hours_played": self.hours_played,
            "last_match_end": int(self.last_match_end.timestamp()),
            "icon": self.icon.to_dict()
        }


class Icon(ModelBase):
    __tablename__ = "Icon"

    id: Mapped[int] = mapped_column(primary_key=True)
    path: Mapped[str] = mapped_column(nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "path": self.path
        }
