"""
Insert some sample data into the database, for testing purposes.
"""

import models
import sqlalchemy
import sqlalchemy.orm

engine = sqlalchemy.create_engine("sqlite:///data.db")
models.ModelBase.metadata.create_all(engine)

# Thank u Costin for letting me use your account here :))
users = [
    {
        "name": "cstn",
        "password": "pass",
        "profile": {
            "riot_puuid": "6EdYfH55OSo1dZlzFz3WRzK8PiOW_vqPc6DNB-vUq2eb3SkdHhIjZrFtl-zHRC2rXjSdnNv0IuzdFQ",
            "riot_region": "EUNE",
            "icon_id": 1
        }
    },
    {
        "name": "99 9 impulse fm",
        "password": "pass",
        "profile": {
            "riot_puuid": "jB7KsGhW3CdoTQ20Em8ugdIVyCFMp9q0dI7szykzG3yjoyvEAlc15eK8Y2QWTmkf9puPSixmyPe1vA",
            "riot_region": "EUW",
            "icon_id": 1
        }
    }
]

icons = [
    {
        "path": "n/a"
    }
]

with sqlalchemy.orm.Session(engine) as sess:
    for icon_data in icons:
        icon = models.Icon(
            path=icon_data["path"]
        )
        sess.add(icon)

    for user_data in users:
        user = models.User(
            name=user_data["name"],
            password=user_data["password"],
        )
        user.profile = models.Profile(
            riot_puuid=user_data["profile"]["riot_puuid"],
            riot_region=user_data["profile"]["riot_region"],
            icon_id=user_data["profile"]["icon_id"]
        )
        sess.add(user)

    sess.commit()
