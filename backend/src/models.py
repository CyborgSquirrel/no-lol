import json
from datetime import datetime

from sqlalchemy import ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class ModelBase(DeclarativeBase):
    """ The base model class from which all the models should inherit from"""

    def to_dict(self) -> dict:
        """ Returns a dict representation of the model.

        This should be implemented by the models to easily return the model's data in the response body.

        Returns: a dict
        """
        pass

    def to_json(self):
        """ Returns a json formatted string as representation of the model.

        Returns: json formatted string
        """
        return json.dumps(self.to_dict())


class User(ModelBase):
    __tablename__ = "User"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(unique=True)
    password: Mapped[str]
    profile: Mapped["Profile"] = relationship(back_populates="user")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "profile": self.profile.to_dict()
        }


class Friendship(ModelBase):
    __tablename__ = "Friendship"

    sender_id: Mapped[int] = mapped_column(nullable=False, primary_key=True)
    receiver_id: Mapped[int] = mapped_column(nullable=False, primary_key=True)

    pending: Mapped[bool] = mapped_column(nullable=False, default=True)


class Profile(ModelBase):
    __tablename__ = "Profile"

    riot_puuid: Mapped[str] = mapped_column(nullable=False, primary_key=True)
    riot_region: Mapped[str] = mapped_column(nullable=False, primary_key=True)

    user_id: Mapped[int] = mapped_column(ForeignKey("User.id"), nullable=False)
    user: Mapped["User"] = relationship(back_populates="profile")

    balance: Mapped[int] = mapped_column(default=0, nullable=False)
    hours_played: Mapped[int] = mapped_column(default=0, nullable=False)

    icon_id: Mapped[int] = mapped_column(ForeignKey("Icon.id"), nullable=True)
    icon: Mapped["Icon"] = relationship()

    last_match_updated: Mapped[datetime] = mapped_column(nullable=True)
    last_match_id: Mapped[int] = mapped_column(nullable=True)
    last_match_end: Mapped[datetime] = mapped_column(nullable=True)

    def to_dict(self):
        return {
            "region": self.riot_region,
            "balance": self.balance,
            "hours_played": self.hours_played,
            "icon_id": self.icon_id,
            "last_match_end": int(self.last_match_end.timestamp()) if self.last_match_id is not None else None
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
