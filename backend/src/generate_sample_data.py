"""
Insert some sample data into the database, for testing purposes.
"""
import argparse
import json
import pathlib
import models
import sqlalchemy.orm
from sqlalchemy import select
import cassiopeia as cass

argparser = argparse.ArgumentParser()
argparser.add_argument("config_file")
args = argparser.parse_args()

engine = sqlalchemy.create_engine("sqlite:///data.db")
models.ModelBase.metadata.create_all(engine)
with open(args.config_file) as f:
    config = json.load(f)
cass.set_riot_api_key(config["riot_api_key"])


users = [
    # Thank u Costin for letting me use your account here :))
    {
        "name": "cstn",
        "password": "pass",
        "profile": {
            "riot_name": "NupMaster",
            "riot_region": "EUNE"
        }
    },
    {
        "name": "99 9 impulse fm",
        "password": "pass",
        "profile": {
            "riot_name": "99 9 impulse fm",
            "riot_region": "EUW"
        }
    },
]


friendships = [
    {
        "sender_name": "cstn",
        "receiver_name": "99 9 impulse fm",
    }
]


with sqlalchemy.orm.Session(engine) as sess:
    for user_data in users:
        # create user
        user = models.User(
            name=user_data["name"],
            password=user_data["password"],
        )

        # fetch icon
        summoner = cass.Summoner(name=user_data["profile"]["riot_name"], region=user_data["profile"]["riot_region"])
        icon = summoner.profile_icon

        # save icon and store in db
        icon_path = f"static/icons/{icon.id}.{icon.image.format.lower()}"
        pathlib.Path(icon_path).parent.mkdir(parents=True, exist_ok=True)

        icon.image.save(icon_path)
        new_icon = models.Icon(id=icon.id, path=icon_path)

        # create profile
        user.profile = models.Profile(
            riot_puuid=summoner.puuid,
            riot_region=user_data["profile"]["riot_region"],
            icon=new_icon
        )
        sess.add(user)

    sess.commit()

    for friendship_data in friendships:
        sender: models.User = sess.query(models.User).filter_by(name=friendship_data["sender_name"]).one()
        receiver: models.User = sess.query(models.User).filter_by(name=friendship_data["receiver_name"]).one()
        
        if sender.id > receiver.id:
            sender, receiver = receiver, sender

        friendship = models.Friendship(
            smaller_user_id=sender.id,
            bigger_user_id=receiver.id,
            pending=True,
            sender_is_smaller_id=True,
        )

        sess.add(friendship)

    sess.commit()
