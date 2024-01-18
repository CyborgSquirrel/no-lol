import argparse
import json
import html
import pathlib
import time
import threading
import dataclasses
from datetime import timedelta
from string import Template
from http import HTTPStatus as status

import cassiopeia as cass
import dacite
import flask
import flask_cors
import sqlalchemy
import sqlalchemy.orm
from flask_mail import Mail, Message

import models

# setup flask & sqlalchemy & mail
app = flask.Flask(__name__)
engine = sqlalchemy.create_engine("sqlite:///data.db")
flask_cors.CORS(app)  # get rid of cors
mail = Mail()

# setup cassiopeia
cass_config = cass.get_default_config()
cass_config["logging"]["print_calls"] = False
cass.apply_settings(cass_config)

# other config
STATIC_PATH = "static"
ICONS_PATH = f"{STATIC_PATH}/icons"


@dataclasses.dataclass
class UserLoginRequest:
    name: str
    password: str


@dataclasses.dataclass
class UserRegisterRequest:
    name: str
    password: str
    summoner_name: str
    region: str
    email: str

@dataclasses.dataclass
class CreateFriendshipRequest:
    sender_id: int
    receiver_id: int


@dataclasses.dataclass
class AcceptFriendshipRequest:
    sender_id: int
    receiver_id: int


@dataclasses.dataclass
class RemoveFriendshipRequest:
    sender_id: int
    receiver_id: int


@dataclasses.dataclass
class CreateBuddyRequest:
    sender_id: int
    receiver_id: int


@dataclasses.dataclass
class AcceptBuddyRequest:
    sender_id: int
    receiver_id: int


@dataclasses.dataclass
class RemoveBuddyRequest:
    sender_id: int
    receiver_id: int


@dataclasses.dataclass
class PendingFriendshipNotification:
    id: int
    name: str


@dataclasses.dataclass
class Notification:
    kind: str
    content: PendingFriendshipNotification


@app.get("/users")
def get_users():
    """Return the list of all users. Applies filters if supplied.

    can filter by:
    - name: all returned users will have string `name` in their name
    - friend_of: all returned users will be friends with the user whose id is `friend_of`
    """

    # TODO: Some kind of pagination?

    args_name = flask.request.args.get("name")
    args_friend_of = flask.request.args.get("friend_of")

    with sqlalchemy.orm.Session(engine) as session:
        if args_friend_of is None:
            users = session.query(models.User)
        else:
            # get ids of all the friends
            user_ids = sqlalchemy.union(
                sqlalchemy.select(models.Friendship.smaller_user_id.label("id"))
                .where(
                    sqlalchemy.and_(
                        models.Friendship.bigger_user_id == args_friend_of,
                        sqlalchemy.not_(models.Friendship.pending),
                    )
                ),

                sqlalchemy.select(models.Friendship.bigger_user_id.label("id"))
                .where(
                    sqlalchemy.and_(
                        models.Friendship.smaller_user_id == args_friend_of,
                        sqlalchemy.not_(models.Friendship.pending),
                    )
                ),
            )

            users = (
                session.query(models.User)
                .join(user_ids, models.User.id == user_ids.c.id)
            )

        if args_name is not None:
            users = users.where(models.User.name.contains(args_name))

        users = users.all()

        result = [user.to_dict() for user in users]
        return result


@app.get("/user/by-id/<int:id>")
def get_user(id: int):
    """ Returns the user by id. """
    with sqlalchemy.orm.Session(engine) as session:
        user = session.query(models.User).filter_by(id=id).one_or_none()

        if user is None:
            return "User not found", status.NOT_FOUND

        return user.to_dict()


@app.get("/user/by-id/<int:user_id>/notifications")
def user_get_notifications(user_id: int):
    notifications = []
    with sqlalchemy.orm.Session(engine) as session:
        user = session.query(models.User).filter_by(id=user_id).one_or_none()
        if user is None:
            return "User not found", status.NOT_FOUND
        
        friendships = (
            session.query(models.Friendship)
            .where(
                sqlalchemy.and_(
                    models.Friendship.receiver_id == user_id,
                    models.Friendship.pending,
                )
            )
            .all()
        )

        for friendship in friendships:
            notifications.append(
                Notification(
                    kind="pending_friendship",
                    content=PendingFriendshipNotification(
                        id=friendship.sender_id,
                        name=friendship.sender.name,
                    ),
                )
            )
    notifications = [
        dataclasses.asdict(notification)
        for notification in notifications
    ]
    return notifications


@app.get("/user/by-id/<int:user_id>/friendship/with-user/by-id/<int:other_user_id>")
def user_friendship_get_with_other_user(user_id: int, other_user_id: int):
    with sqlalchemy.orm.Session(engine) as session:
        friendship = (
            session.query(models.Friendship)
            .where(
                sqlalchemy.or_(
                    sqlalchemy.and_(
                        models.Friendship.smaller_user_id == user_id,
                        models.Friendship.bigger_user_id == other_user_id,
                    ),
                    sqlalchemy.and_(
                        models.Friendship.smaller_user_id == other_user_id,
                        models.Friendship.bigger_user_id == user_id,
                    ),
                )
            )
            .one_or_none()
        )

        if friendship is None:
            friendship = dict()
        else:
            friendship = friendship.to_dict()
       
        return friendship


@app.post("/friendship/create")
def friendship_create():
    data = flask.request.json

    try:
        data = dacite.from_dict(data_class=CreateFriendshipRequest, data=data)
    except dacite.DaciteError:
        return "Wrong fields or data types", status.BAD_REQUEST

    with sqlalchemy.orm.Session(engine) as session:
        sender_smaller = True

        if data.sender_id > data.receiver_id:
            sender_smaller = False

        new_friendship: models.Friendship = models.Friendship(
            smaller_user_id=data.sender_id if sender_smaller else data.receiver_id,
            bigger_user_id=data.receiver_id if sender_smaller else data.sender_id,
            sender_is_smaller_id=sender_smaller,
            pending=True,
        )

        session.add(new_friendship)
        session.commit()
        
        return new_friendship.to_dict(), status.OK


@app.put("/friendship/accept")
def friendship_accept():
    data = flask.request.json

    try:
        data = dacite.from_dict(data_class=AcceptFriendshipRequest, data=data)
    except dacite.DaciteError:
        return "Wrong fields or data types", status.BAD_REQUEST

    with sqlalchemy.orm.Session(engine) as session:

        smaller_id, bigger_id = data.sender_id, data.receiver_id 
        if smaller_id > bigger_id:
            smaller_id, bigger_id = bigger_id, smaller_id
        friendship = session.get(models.Friendship, (smaller_id, bigger_id))
        friendship.pending = False

        session.commit()
        
        return friendship.to_dict(), status.OK


@app.delete("/friendship/remove")
def friendship_remove():
    data = flask.request.json

    try:
        data = dacite.from_dict(data_class=RemoveFriendshipRequest, data=data)
    except dacite.DaciteError:
        return "Wrong fields or data types", status.BAD_REQUEST

    with sqlalchemy.orm.Session(engine) as session:

        smaller_id, bigger_id = data.sender_id, data.receiver_id 
        if smaller_id > bigger_id:
            smaller_id, bigger_id = bigger_id, smaller_id
        
        session.query(models.Friendship).filter_by(smaller_user_id=smaller_id, bigger_user_id=bigger_id).delete()
        session.commit()
        
        return "", status.OK


@app.post("/buddy/create")
def buddy_create():
    data = flask.request.json

    try:
        data = dacite.from_dict(data_class=CreateBuddyRequest, data=data)
    except dacite.DaciteError:
        return "Wrong fields or data types", status.BAD_REQUEST

    with sqlalchemy.orm.Session(engine) as session:
        sender_smaller = True

        if data.sender_id > data.receiver_id:
            sender_smaller = False

        smaller_id, bigger_id = data.sender_id, data.receiver_id
        if smaller_id > bigger_id:
            smaller_id, bigger_id = bigger_id, smaller_id
        friendship = session.get(models.Friendship, (smaller_id, bigger_id))

        if friendship is None or friendship.pending is True:
            return "Friends before buddies", status.NOT_FOUND

        friendship.smaller_user_id = data.sender_id if sender_smaller else data.receiver_id
        friendship.bigger_user_id = data.receiver_id if sender_smaller else data.sender_id
        friendship.sender_is_smaller_id = sender_smaller
        friendship.pending_buddy = True

        session.commit()

        return friendship.to_dict(), status.OK


@app.put("/buddy/accept")
def buddy_accept():
    data = flask.request.json

    try:
        data = dacite.from_dict(data_class=AcceptBuddyRequest, data=data)
    except dacite.DaciteError:
        return "Wrong fields or data types", status.BAD_REQUEST

    with sqlalchemy.orm.Session(engine) as session:

        smaller_id, bigger_id = data.sender_id, data.receiver_id
        if smaller_id > bigger_id:
            smaller_id, bigger_id = bigger_id, smaller_id
        friendship = session.get(models.Friendship, (smaller_id, bigger_id))

        if friendship is None or friendship.pending_buddy is False:
            return "Buddy request does not exist", status.NOT_FOUND

        friendship.pending_buddy = False
        friendship.buddies = True

        session.commit()

        return friendship.to_dict(), status.OK


@app.delete("/buddy/remove")
def buddy_remove():
    data = flask.request.json

    try:
        data = dacite.from_dict(data_class=AcceptBuddyRequest, data=data)
    except dacite.DaciteError:
        return "Wrong fields or data types", status.BAD_REQUEST

    with sqlalchemy.orm.Session(engine) as session:

        smaller_id, bigger_id = data.sender_id, data.receiver_id
        if smaller_id > bigger_id:
            smaller_id, bigger_id = bigger_id, smaller_id
        friendship = session.get(models.Friendship, (smaller_id, bigger_id))

        if friendship is None or (friendship.pending_buddy is False and friendship.buddies is False):
            return "Buddy request does not exist or they are not buddies", status.NOT_FOUND

        friendship.pending_buddy = False
        friendship.buddies = False

        session.commit()

        return friendship.to_dict(), status.OK


@app.post("/user/register")
def user_register():
    data = flask.request.json

    try:
        data = dacite.from_dict(data_class=UserRegisterRequest, data=data)
    except dacite.DaciteError:
        return "Wrong fields or data types", status.BAD_REQUEST
    
    try:
        summoner = cass.Summoner(name=data.summoner_name, region=data.region)
    except ValueError:
        return "bad region probably", status.BAD_REQUEST
    if summoner.exists is False:
        return "summoner does not exist", status.BAD_REQUEST
        
    with sqlalchemy.orm.Session(engine) as session:
        new_user: models.User = models.User(
            name=data.name,
            password=data.password,
            email=data.email,
        )
        new_user.profile = models.Profile(
            riot_puuid=summoner.puuid,
            riot_region=data.region
        )

        session.add(new_user)
        try:
            session.commit()
        except sqlalchemy.exc.IntegrityError as ex:
            args = set(ex.args)
            # TODO: Better way to check for these? This will break if we change
            # the constraints.
            response = dict(
                name_already_exists="(sqlite3.IntegrityError) UNIQUE constraint failed: User.name" in args,
                summoner_already_exists="(sqlite3.IntegrityError) UNIQUE constraint failed: Profile.riot_puuid, Profile.riot_region" in args,
                email_already_exists="(sqlite3.IntegrityError) UNIQUE constraint failed: User.email" in args,
            )
            return response, status.BAD_REQUEST

        # update user profile
        update_user(new_user.id)

        return new_user.to_dict(), status.OK


@app.post("/user/login")
def user_login():
    data = flask.request.json
    try:
        data = dacite.from_dict(data_class=UserLoginRequest, data=data)
    except dacite.DaciteError:
        return "Wrong fields or data types", status.BAD_REQUEST

    with sqlalchemy.orm.Session(engine) as session:
        user: models.User = session.query(models.User).filter_by(name=data.name).one_or_none()
        if user is None:
            return "Incorrect username", status.UNAUTHORIZED

    if user.password != data.password:
        return "Incorrect password", status.UNAUTHORIZED

    return dict(id=user.id)


@app.get("/icon/by-id/<int:id>")
def get_icon(id: int):
    with sqlalchemy.orm.Session(engine) as session:
        icon = session.query(models.Icon).filter_by(id=id).one_or_none()
        if icon is None:
            return "Icon not found", status.NOT_FOUND

        # get absolute path
        icon_path = pathlib.Path(icon.path).resolve()

        return flask.send_file(icon_path, "image/png")


def update_user(id: int):
    """ This method will update the user's profile with the given id.

    Possible updates:
        - profile icon: if it does not exist it will be fetched and stored
        - last match: it is updated with the match start datetime + user's time played

    Note:
        If the user has played a league of legends match, since the last update, it's buddy
        will be notified.

    Args:
        id (int): id of a user
    """
    with sqlalchemy.orm.Session(engine) as session:
        user = session.query(models.User).filter_by(id=id).one()
        profile = user.profile

        # get summoner associated with user
        summoner = cass.Summoner(puuid=profile.riot_puuid, region=profile.riot_region)

        # 1) check summoner's icon
        icon = summoner.profile_icon
        if profile.icon is None or profile.icon.id != icon.id:
            # get the new icon
            new_icon = session.query(models.Icon).filter_by(id=icon.id).one_or_none()

            # fetch and store the new icon if it does not already exist
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
        if len(match_history) > 0:
            last_match = match_history[0]
            if profile.last_match_id != last_match.id:
                participant = next((p for p in last_match.participants if p.summoner.puuid == profile.riot_puuid), None)

                # this should not happen
                if participant is None:
                    assert False

                last_match_end = (last_match.start + timedelta(seconds=participant.stats.time_played)).datetime

                profile.last_match_id = last_match.id
                profile.last_match_end = last_match_end

                # notify buddy (for relapse)
                buddy_friendship = session.query(models.Friendship).filter(
                    ((models.Friendship.bigger_user_id == user.id) | (models.Friendship.smaller_user_id == user.id))
                    & models.Friendship.buddies
                ).one_or_none()

                if buddy_friendship is not None:
                    buddy = buddy_friendship.bigger_user if buddy_friendship.bigger_user_id != user.id else buddy_friendship.smaller_user

                    # read email template
                    with open(pathlib.Path(__file__).parent / "email.html") as file:
                        email_template = Template(file.read())

                    # send email
                    with app.app_context():
                        msg = Message("Your buddy has relapsed", recipients=[buddy.email])
                        msg.html = email_template.substitute({
                            "user_name": html.escape(buddy.name),
                            "buddy_name": html.escape(user.name),
                            "date_played": html.escape(last_match.creation.strftime("%d.%m.%Y")),
                            "time_played": html.escape(last_match.creation.strftime("%I:%M %p"))
                        })
                        mail.send(msg)

        session.commit()


def update_users(interval: int):
    """ This method will update the users' profiles at regular intervals of time, defined by `interval`.

    Args:
        interval (int): interval of time (in seconds) at which the users are updated
    """
    while True:
        time.sleep(interval)
        print("Updating profiles...")

        with sqlalchemy.orm.Session(engine) as session:
            users = session.query(models.User).all()
            for user in users:
                update_user(user.id)

        print("Updated successfully")


def main(args):
    # config file
    with open(args.config_file) as f:
        config = json.load(f)
    cass.set_riot_api_key(config["riot_api_key"])

    # create db
    models.ModelBase.metadata.create_all(engine)

    # init mail
    app.config["MAIL_SERVER"] = config["email_server"]
    app.config["MAIL_PORT"] = config["email_port"]
    app.config["MAIL_USE_TLS"] = True
    app.config["MAIL_USERNAME"] = config["email_username"]
    app.config["MAIL_PASSWORD"] = config["email_password"]
    app.config["MAIL_DEFAULT_SENDER"] = config["email_username"]
    mail.init_app(app)

    # init daemon that updates the users periodically
    daemon = threading.Thread(target=update_users, args=(3600,), daemon=True, name="Updater daemon")
    daemon.start()

    # run flask
    app.run(host="0.0.0.0", port=5000, debug=False)


if __name__ == "__main__":
    # cli args
    argparser = argparse.ArgumentParser()
    argparser.add_argument("config_file")

    main(argparser.parse_args())
