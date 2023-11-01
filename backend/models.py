import json
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey


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

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("User.id"), nullable=False)
    user: Mapped["User"] = relationship(back_populates="profile")
    summoner: Mapped[str]
    balance: Mapped[int] = mapped_column(default=0, nullable=False)
    last_match_id: Mapped[int]
    hours_played: Mapped[int] = mapped_column(default=0, nullable=False)
    icon_id: Mapped[int] = mapped_column(ForeignKey("Icon.id"))
    icon: Mapped["Icon"] = relationship()

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "balance": self.balance,
            "hours_played": self.hours_played,
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
