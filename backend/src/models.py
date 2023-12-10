import json
from datetime import datetime

from sqlalchemy import ForeignKey, CheckConstraint, case, select
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, column_property, object_session


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
    __table_args__ = (
        CheckConstraint("smaller_user_id < bigger_user_id"),
    )

    # This ensured uniqueness so that there can not be a friendship between personA - personB AND personB - personA
    smaller_user_id: Mapped[int] = mapped_column(ForeignKey("User.id"), nullable=False, primary_key=True)
    bigger_user_id: Mapped[int] = mapped_column(ForeignKey("User.id"), nullable=False, primary_key=True)
    smaller_user: Mapped["User"] = relationship("User", foreign_keys=[smaller_user_id])
    bigger_user: Mapped["User"] = relationship("User", foreign_keys=[bigger_user_id])

    pending: Mapped[bool] = mapped_column(nullable=False, default=True)

    sender_is_smaller_id: Mapped[bool] = mapped_column(nullable=False)
    sender_id: Mapped[int] = column_property(
        case(
            (sender_is_smaller_id, smaller_user_id),
            else_=bigger_user_id,
        )
    )
    
    @property
    def sender(self):
        return object_session(self).scalar(select(User).where(User.id == self.sender_id))

    receiver_id: Mapped[int] = column_property(
        case(
            (sender_is_smaller_id, bigger_user_id),
            else_=smaller_user_id,
        )
    )
    
    @property
    def receiver(self):
        return object_session(self).scalar(select(User).where(User.id == self.receiver_id))


    def to_dict(self):
        return {
            "smaller_user_id": self.smaller_user_id,
            "smaller_user": self.smaller_user.to_dict(),
            "bigger_user_id": self.bigger_user_id,
            "bigger_user": self.bigger_user.to_dict(),
            "pending": self.pending,
            "sender_is_smaller_id": self.sender_is_smaller_id,
            "sender": self.sender.to_dict(),
            "receiver": self.receiver.to_dict(),
        }


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
