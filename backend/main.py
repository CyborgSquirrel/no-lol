import argparse
import base64
import json
from dataclasses import dataclass
from datetime import datetime, timedelta
from http import HTTPStatus as status
from io import BytesIO

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


class UserListView(views.MethodView):
    def get(self):
        """ Returns the list of all users. """
        with sqlalchemy.orm.Session(engine) as session:
            users = session.query(models.User).all()
            result = [user.to_dict() for user in users]
            return result

    def post(self):
        """ Creates a new user. """
        data = flask.request.json
        with sqlalchemy.orm.Session(engine) as session:
            entity = models.User(**data)
            session.add(entity)
            session.commit()
            return "", status.CREATED


class UserDetailView(views.MethodView):
    wait_time = timedelta(hours=1)      # time to wait between profile updates

    def _get_user_data(self, id: int) -> dict:
        """ Retrieves the user by id.

        Args:
            id (int): id of the user

        Returns: a dictionary containing user data
        """
        with sqlalchemy.orm.Session(engine) as session:
            user: models.User = session.query(models.User).filter_by(id=id).one()
            profile: models.Profile = user.profile

            # check whether last_match information is out of date (or missing),
            # and if it is, update it.
            now = datetime.now()
            if (
                profile.last_match_updated is None or
                now - profile.last_match_updated >= self.wait_time
            ):
                # TODO: Handle the case where it's an account on which no
                # matches have been played.
                summoner = cass.Summoner(puuid=profile.riot_puuid, region=profile.riot_region)
                last_match = summoner.match_history[0]

                profile.last_match_updated = now
                if profile.last_match_id != last_match.id:
                    last_match_end = (last_match.start + last_match.duration).datetime
                    profile.last_match_id = last_match.id
                    profile.last_match_end = last_match_end

            session.commit()

            return user.to_dict()

    def get(self, id: int):
        """ Returns the user by id. """
        user_data = self._get_user_data(id)
        return user_data


@dataclass
class UserLoginRequest:
    name: str
    password: str


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

    return flask.jsonify(dict(id=user.id))


# here i just played with cassiopeia package
# it's not important
@app.get("/bla")
def test():
    summoner = cass.get_summoner(name="99 9 impulse fm", region="EUW")

    image = BytesIO()
    summoner.profile_icon.image.save(image, "JPEG")
    image_base64 = base64.b64encode(image.getvalue()).decode("utf-8")

    matches: list[cass.Match] = list(summoner.match_history)
    print(matches[0].participants)

    return {
        "name": "bla",
        "other": matches
    }


def main():
    # cli args
    argparser = argparse.ArgumentParser()
    argparser.add_argument("config_file")
    args = argparser.parse_args()

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
    main()
