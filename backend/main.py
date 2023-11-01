import flask
import flask_cors
import flask.views as views
import sqlalchemy
import sqlalchemy.orm
from http import HTTPStatus as status

import models

from io import BytesIO
import base64
import cassiopeia as cass


# setup flask & sqlalchemy
app = flask.Flask(__name__)
engine = sqlalchemy.create_engine("sqlite:///data.db")
flask_cors.CORS(app)  # get rid of cors

# setup cassiopeia
cass_config = cass.get_default_config()
cass_config["logging"]["print_calls"] = False
cass.apply_settings(cass_config)
cass.set_riot_api_key("")


class UserListView(views.MethodView):
    def get(self):
        with sqlalchemy.orm.Session(engine) as session:
            result = session.query(models.User).all()
        return result

    def post(self):
        data = flask.request.json
        with sqlalchemy.orm.Session(engine) as session:
            entity = models.User(**data)
            session.add(entity)
            session.commit()
        return "", status.CREATED


class UserDetailView(views.MethodView):
    def _get_entity(self, id: int):
        with sqlalchemy.orm.Session(engine) as session:
            return session.query(models.User).filter_by(id=id).one()

    def get(self, id: int):
        entity = self._get_entity(id)
        return entity.to_json()


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
    # routes
    app.add_url_rule("/users", view_func=UserListView.as_view("user_list"))
    app.add_url_rule("/user/<int:id>", view_func=UserDetailView.as_view("user_detail"))

    models.ModelBase.metadata.create_all(engine)
    app.run(host="0.0.0.0", port=5000, debug=True)


if __name__ == "__main__":
    main()
