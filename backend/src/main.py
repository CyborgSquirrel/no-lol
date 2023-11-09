import argparse
import json
import pathlib
from dataclasses import dataclass
from datetime import datetime, timedelta
from http import HTTPStatus as status

import cassiopeia as cass
import dacite
import flask
import flask.views as views
import flask_cors
import sqlalchemy
import sqlalchemy.orm

import models

# setup flask & sqlalchemy
app = flask.Flask(__name__)
engine = sqlalchemy.create_engine("sqlite:///data.db")
flask_cors.CORS(app)  # get rid of cors

# setup cassiopeia
cass_config = cass.get_default_config()
cass_config["logging"]["print_calls"] = False
cass.apply_settings(cass_config)

# other config
STATIC_PATH = "static"
ICONS_PATH = f"{STATIC_PATH}/icons"


class UserListView(views.MethodView):
    def get(self):
        """ Returns the list of all users. """
        with sqlalchemy.orm.Session(engine) as session:
            users = session.query(models.User).all()
            result = [user.to_dict() for user in users]
            return result


class UserDetailView(views.MethodView):
    wait_time = timedelta(hours=1)      # time to wait between profile updates

    def _get_user_data(self, id: int) -> dict | None:
        """ Retrieves the user dict representation by id. If no user was found it will return None.

        This method will update at regular intervals of time, defined by `wait_time`, the user's profile

        Possible updates:
            - profile icon: if it does not exist it will be fetched and stored
            - last match: it is updated with the match start datetime + user's time played

        Args:
            id (int): id of the user

        Returns: a dictionary containing user data if the user was found else None
        """
        with sqlalchemy.orm.Session(engine) as session:
            user: models.User = session.query(models.User).filter_by(id=id).one_or_none()

            # user not found
            if user is None:
                return None

            profile: models.Profile = user.profile

            # check whether profile information is out of date (or missing),
            # and if it is, update it
            now = datetime.now()
            if (
                profile.last_match_updated is None
                or now - profile.last_match_updated >= self.wait_time
            ):
                profile.last_match_updated = now

                # get summoner associated with user
                summoner = cass.Summoner(puuid=profile.riot_puuid, region=profile.riot_region)

                # 1) check summoner's icon
                icon = summoner.profile_icon
                if profile.icon.id != icon.id:
                    # get the new icon
                    new_icon: models.Icon = session.query(models.Icon).filter_by(id=icon.id).one_or_none()

                    # if icon is missing, save and store it
                    if new_icon is None:
                        # save and store in db
                        icon_path = f"{ICONS_PATH}/{icon.id}.{icon.image.format.lower()}"
                        pathlib.Path(icon_path).parent.mkdir(parents=True, exist_ok=True)

                        icon.image.save(icon_path)
                        new_icon = models.Icon(id=icon.id, path=icon_path)

                    # assign the new icon
                    profile.icon = new_icon

                # 2) check summoner's match history
                match_history = summoner.match_history

                # if match history is empty an exception will be raised and ignore
                # otherwise update the last match if necessary
                try:
                    last_match = match_history[0]
                    if profile.last_match_id != last_match.id:
                        participant = next((p for p in last_match.participants if p.summoner.puuid == profile.riot_puuid), None)
                        if participant is None:
                            # this should not happen
                            assert False

                        last_match_end = (last_match.start + timedelta(seconds=participant.stats.time_played)).datetime
                        profile.last_match_id = last_match.id
                        profile.last_match_end = last_match_end
                except IndexError:
                    pass

            session.commit()

            return user.to_dict()

    def get(self, id: int):
        """ Returns the user by id. """
        user_data = self._get_user_data(id)
        if user_data is None:
            return "", status.NOT_FOUND
        return user_data


@dataclass
class UserLoginRequest:
    name: str
    password: str


@dataclass
class UserRegisterRequest:
    name: str
    password: str
    summoner_name: str
    region: str

@app.post("/user/register")
def user_register():
    data = flask.request.json

    try:
        data = dacite.from_dict(data_class=UserRegisterRequest, data=data)
    except dacite.DaciteError:
        return "", status.BAD_REQUEST
    
    try:
        summoner = cass.Summoner(name=data.summoner_name, region=data.region)
    except ValueError:
        return "bad region probably", status.BAD_REQUEST
    if summoner.exists is False:
        return "summoner does not exist", status.BAD_REQUEST
        
    with sqlalchemy.orm.Session(engine) as session:
        new_user: models.User = models.User(
            name=data.name,
            password=data.password
        )
        new_user.profile = models.Profile(
            riot_puuid=summoner.puuid,
            riot_region=data.region
        )

        session.add(new_user)
        session.commit()
        
        return new_user.to_dict(), status.OK


@app.post("/user/login")
def user_login():
    data = flask.request.json
    try:
        data = dacite.from_dict(data_class=UserLoginRequest, data=data)
    except dacite.DaciteError:
        return "", status.BAD_REQUEST

    with sqlalchemy.orm.Session(engine) as session:
        user: models.User = session.query(models.User).filter_by(name=data.name).one_or_none()
        if user is None:
            return "", status.UNAUTHORIZED

    if user.password != data.password:
        return "", status.UNAUTHORIZED

    return dict(id=user.id)


@app.get("/icon/by-id/<int:id>")
def get_icon(id: int):
    with sqlalchemy.orm.Session(engine) as session:
        icon: models.Icon = session.query(models.Icon).filter_by(id=id).one_or_none()
        if icon is None:
            return "", status.NOT_FOUND

        # get abolute path
        icon_path = pathlib.Path(icon.path).resolve()

        return flask.send_file(icon_path, "image/png")


def main(args):
    # config file
    with open(args.config_file) as f:
        config = json.load(f)
    cass.set_riot_api_key(config["riot_api_key"])
    
    # routes
    app.add_url_rule("/users", view_func=UserListView.as_view("user_list"))
    app.add_url_rule("/user/by-id/<int:id>", view_func=UserDetailView.as_view("user_detail"))

    # create db & run flask
    models.ModelBase.metadata.create_all(engine)
    app.run(host="0.0.0.0", port=5000, debug=True)


if __name__ == "__main__":
    # cli args
    argparser = argparse.ArgumentParser()
    argparser.add_argument("config_file")

    main(argparser.parse_args())
