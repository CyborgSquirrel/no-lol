"""
Insert some sample data into the database, for testing purposes.
"""
import argparse
import json
import pathlib
import models
import sqlalchemy.orm
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
            "riot_puuid": "EM3ArU5HIZLIwAMqmbuhgCpZ9NxdOVFbQQ1bTto5yt5HMqXlv6QDeyo4WFsfyID7OPJEOPkbaSUo3Q",
            "riot_region": "EUNE"
        }
    },
    {
        "name": "99 9 impulse fm",
        "password": "pass",
        "profile": {
            "riot_puuid": "Blgfgj-GgVp28saKyNSAqd2_aF70KEvk_EjpkTUPj31zqSIhAojYurIobMkJBTNGtgvbk8tkSLlU5A",
            "riot_region": "EUW"
        }
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
        summoner = cass.Summoner(puuid=user_data["profile"]["riot_puuid"], region=user_data["profile"]["riot_region"])
        icon = summoner.profile_icon

        # save icon and store in db
        icon_path = f"static/icons/{icon.id}.{icon.image.format.lower()}"
        pathlib.Path(icon_path).parent.mkdir(parents=True, exist_ok=True)

        icon.image.save(icon_path)
        new_icon = models.Icon(id=icon.id, path=icon_path)

        # create profile
        user.profile = models.Profile(
            riot_puuid=user_data["profile"]["riot_puuid"],
            riot_region=user_data["profile"]["riot_region"],
            icon=new_icon
        )
        sess.add(user)

    sess.commit()
