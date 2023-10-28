import flask
import flask_cors

import db

# setup stuff
app = flask.Flask(__name__)
engine = sqlalchemy.create_engine("sqlite:///data.db")
flask_cors.CORS(app)  # get rid of cors


# NOTE(andreij): sample flask route
@app.route("/sample", methods=["GET"])
def get_sample():
    pass


if __name__ == "__main__":
    db.Base.metadata.create_all(engine)
    app.run(host="0.0.0.0", port=5000, debug=True)
