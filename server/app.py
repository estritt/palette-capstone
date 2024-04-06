from flask import make_response, jsonify, request, session
from flask_restful import Resource
from marshmallow import fields # need these for nested structures

from config import app, db, api, ma
# should use marshmallow validation

from models import User, Follow, Entity, Like
auto_field = ma.auto_field

#might be more restful to use username instead of id in the returned url?

#there are no "replace" methods implemented

def patcher(id, model, schema):
    match = model.query.filter_by(id=id).first()
    if not match:
        return make_response({"error": f"{model} not found"}, 404)
    for attr in request.json:
        setattr(match, attr, request.json[attr])

    db.session.add(match)
    db.session.commit()

    return make_response(schema.dump(match), 202)

def getter(model, schema):# takes plural schema (many=True)
    rows = model.query.all()
    return make_response(schema.dump(rows), 200)

def getterFromID(id, model, schema): # takes singular schema
    match = model.query.filter_by(id=id).first()
    if match:
        return make_response(schema.dump(match), 200)
    else:
        return make_response({"error": f"{model} not found"}, 404)
    
def poster(model, schema):# takes singular schema
    new_entry = model(**request.get_json()) # splash operator sets values from dict for kwargs
    db.session.add(new_entry)
    db.session.commit()
    return make_response(schema.dump(new_entry), 201)

def deleter(id, model, schema):
    match = model.query.filter_by(id=id).first()
    if not match:
        return make_response({"error": f"{model} not found"}, 404)
    match_dump = schema.dump(match)

    db.session.delete(match)
    db.session.commit()

    return make_response(schema.dump(match), 200)

class UserSchema(ma.SQLAlchemySchema):
    
    class Meta:
        model = User
        load_instance = True

    # could maybe use locals() to assign these fields all at once but that would probably be bad
    # id = ma.auto_field(dump_only=True) #url will handle this
    username = auto_field()
    bio = auto_field()
    created_at = auto_field(dump_only=True)
    # following = auto_field()
    # followed_by = auto_field()
    following = fields.Nested(lambda: FollowSchema(many=True, only=("following_user.username",)))
    followed_by = fields.Nested(lambda: FollowSchema(many=True, only=("following_user.username",)))
    # ^ following and followed_by are ugly and deeply nested but it will work for now
    # followed_by = fields.List(fields.String, attribute="followed_by")

    # posts = auto_field()
    # posts = fields.Nested(lambda: EntitySchema(exclude=("",)))
    posts = fields.Nested(lambda: EntitySchema(many=True, exclude=("user_c", "user_p")))
    comments = fields.Nested(lambda: EntitySchema(many=True, exclude=("user_c", "user_p")))
    # has_liked = fields.Nested(lambda: likes_schema)

    url = ma.Hyperlinks(
        {
            "self": ma.URLFor(
                "users",
                values=dict(id="<id>")),
            "collection": ma.URLFor("users"),
        }
    )

user_schema = UserSchema()
users_schema = UserSchema(many=True)

class Users(Resource):

    def get(self):
        return getter(User, users_schema)
    
    def post(self):
        return poster(User, user_schema)

api.add_resource(Users, '/users')

class UsersByID(Resource):

    def get(self, id):
        return getterFromID(id, User, user_schema)
    
    def patch(self, id):
        return patcher(id, User, user_schema)

api.add_resource(UsersByID, '/users/<int:id>')

# i considered handling new follows/likes with patch requests to user and entity but that isn't restful
class FollowSchema(ma.SQLAlchemySchema): 
    
    class Meta:
        model = Follow
        load_instance = True

    # following_user_id = auto_field()
    # followed_user_id = auto_field()
    following_user = fields.Nested(lambda: user_schema)
    followed_user = fields.Nested(lambda: user_schema)
    created_at = auto_field()

    url = ma.Hyperlinks(
        {
            "self": ma.URLFor(
                "follows",
                values=dict(id="<id>")),
            "collection": ma.URLFor("follows"),
        }
    )

follow_schema = FollowSchema()
follows_schema = FollowSchema(many=True)

class Follows(Resource):

    def get(self): # might be able to get rid of this method
        return getter(Follow, follows_schema)

    def post(self):
        return poster(Follow, follow_schema)
    
api.add_resource(Follows, '/follows')

class FollowByID(Resource):

    def get(self, id): 
        return getterFromID(id, Follow, follow_schema)
    
    def patch(self, id):
        return patcher(id, Follow, follow_schema)
    
    def delete(self, id):
        return deleter(id, Follow, follow_schema)
    
api.add_resource(FollowByID, '/follows/<int:id>')

class EntitySchema(ma.SQLAlchemySchema):

    class Meta:
        model = Entity
        load_instance = True

    # user_id = auto_field()
    parent_id = auto_field()
    published = auto_field()
    artwork_path = auto_field()
    title = auto_field()
    body = auto_field()
    created_at = auto_field()
    last_updated = auto_field()

    # user_p = auto_field()
    user_p = fields.Nested(lambda: UserSchema(only=('username',)))
    # user_c = auto_field()
    user_c = fields.Nested(lambda: UserSchema(only=('username',)))
    # children = auto_field()
    children = fields.Nested(lambda: entities_schema)
    # liked_by = auto_field()
    liked_by = fields.Nested(lambda: UserSchema(many=True, only=('username',)))

    url = ma.Hyperlinks(
        {
            "self": ma.URLFor(
                "entities",
                values=dict(id="<id>")),
            "collection": ma.URLFor("entities"),
        }
    )

entity_schema = EntitySchema()
entities_schema = EntitySchema(many=True)

class Entities(Resource):

    def get(self):
        return getter(Entity, entities_schema)
    
    def post(self):
        return poster(Entity, entity_schema)

api.add_resource(Entities, '/entities')

class EntityByID(Resource):

    def get(self, id):
        return getterFromID(id, Entity, entity_schema)
    
    def patch(self, id):
        return patcher(id, Entity, entity_schema)
    
api.add_resource(EntityByID, '/entities/<int:id>')
    
class LikeSchema(ma.SQLAlchemySchema):

    class Meta:
        model = Like
        load_instance = True

    created_at = auto_field()

    user_id = auto_field()
    entity_id = auto_field()

    url = ma.Hyperlinks(
        {
            "self": ma.URLFor(
                "likes",
                values=dict(user_id="<user_id>", entity_id="<entity_id>")),
            "collection": ma.URLFor("likes"),
        }
    )

like_schema = LikeSchema()
likes_schema = LikeSchema(many=True)

class Likes(Resource):

    def get(self): # can maybe get rid of 
        return getter(Like, likes_schema)
    
    def post(self):
        return poster(Like, like_schema)
    
api.add_resource(Likes, '/likes')

class LikeByID(Resource):

    def delete(self, id):
        return deleter(id, Like, like_schema)

api.add_resource(LikeByID, '/likes/<int:id>')

# class Posts(Resource):

#     def get(self):
#         posts = Entity.query.filter(Entity.parent_id.is_(None)).all()
#         return make_response(entities_schema.dump(posts), 200)
    
# api.add_resource(Posts, '/posts')

# class PostsByUser:
#     pass

# class Comments(Resource):
#     pass