"""
Insert some sample data into the database, for testing purposes.
"""

import models
import sqlalchemy
import sqlalchemy.orm

engine = sqlalchemy.create_engine("sqlite:///data.db")
models.ModelBase.metadata.create_all(engine)

with sqlalchemy.orm.Session(engine) as sess:
    # Thank u Costin for letting me use your account here :))
    user = models.User(
        name="cstn",
        password="pass",
    )
    user.profile = models.Profile(
        riot_id="jdmPqyCWzzU8GK412CbHGEh9bkUmuYptt6wBrzLFm3WPNWs",
        riot_region="EUNE",
    )
    user.profile.icon = models.Icon(
        path="TODO",
    )
    sess.add(user)
    sess.commit()
