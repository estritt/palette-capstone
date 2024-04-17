from flask import make_response, jsonify, request, session, send_file
from flask_restful import Resource
from marshmallow import fields # need these for nested structures
from sqlalchemy import desc
from werkzeug.utils import secure_filename
import os
from uuid import uuid4

from config import app, db, api, ma
# should use marshmallow validation
from models import User, Follow, Entity, Like
auto_field = ma.auto_field

# need to break up views to not return so much! 

# should make paginated posts and comments

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
    avatar_filename = auto_field()
    created_at = auto_field(dump_only=True)
    # following = auto_field()
    # followed_by = auto_field()
    following = fields.Nested(lambda: FollowSchema(many=True, only=("followed_user.username", 'followed_user.url.self')))
    followed_by = fields.Nested(lambda: FollowSchema(many=True, only=("following_user.username", 'following_user.url.self')))
    # ^ following and followed_by are ugly and deeply nested but it will work for now
    # also the urls aren't showing up

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

class AvatarSchema(ma.Schema): #add validation!
    #should add urls?
    #as of now, could handle avatars and artworks with one schema instead

    # file = fields.Raw(required=True) # FileStorage not serializable ? 
    # need to use file.read if i want to send the file contents in a serializable format for marshmallow to validate
    file_path = fields.String(required=True)

avatar_schema = AvatarSchema()
# avatars_schema = AvatarSchema(many=True)

class Avatars(Resource): 

    def post(self):
        file_data = request.files['image']
        # filename = secure_filename(file_data.filename)
        filename = secure_filename(uuid4().hex) + '.jpg' #i dont think secure filename will ever do anything here
        file_path = os.path.join('./avatars/', filename)

        errors = avatar_schema.validate({'file_path': file_path}) #make validations
        if errors:
            return make_response({'errors': errors}, 400)

        file_data.save(file_path)
        # return make_response(avatar_schema.dump({'file': file_data, 'file_path': file_path}), 201)
        return make_response({'filename': filename, 'file_path': file_path}, 201)

api.add_resource(Avatars, '/avatars')

class ImageFromPath(Resource):
    def get(self, path): #might want validation since this only should be used for paths with avatar or artwork
        return send_file(path, mimetype='image/jpeg')
    
api.add_resource(ImageFromPath, '/images/<path:path>')

# class AvatarFromPath(Resource):

#     def get(self, path):
#         return send_file(path, mimetype='image/jpeg')
    
# api.add_resource(AvatarFromPath, '/avatars/<path:path>')

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
    user_p = fields.Nested(lambda: UserSchema(only=('username', 'url.self', 'avatar_filename')))
    # user_c = auto_field()
    user_c = fields.Nested(lambda: UserSchema(only=('username', 'url.self', 'avatar_filename')))
    # children = auto_field()
    children = fields.Nested(lambda: entities_schema)
    # liked_by = auto_field()
    liked_by = fields.Nested(lambda: UserSchema(many=True, only=('username', 'url.self')))

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

class Posts(Resource):

    def get(self):
        posts = Entity.query.filter(Entity.parent_id.is_(None), Entity.published.is_(True)).all()
        return make_response(EntitySchema(only=('url.self', 'artwork_path', 'title'), many=True).dump(posts), 200)
    
api.add_resource(Posts, '/posts')

class PostsFromFollowing(Resource):

    def get(self):
        if not session.get('user_id'):
            return make_response({'error': 'not logged in'}, 401)
        page_number = request.args.get('page', 1)
        page_size = request.args.get('size', 10)
        offset = (page_number - 1) * page_size
        active_user = User.query.filter_by(id=session['user_id']).first()
        followed_usernames = [entry.followed_user.username for entry in active_user.following] # over-nested
        followed_posts = Entity.query.filter(Entity.parent_id.is_(None), Entity.user.username.in_(followed_usernames)).order_by(desc(Entity.created_at)).offset(offset).limit(page_size).all()
        return make_response({'posts': entities_schema.dump(followed_posts),
                              'page': page_number,
                              'size': page_size}, 200)
    
api.add_resource(PostsFromFollowing, '/posts-from-following')

class PostByFilename(Resource):
# i considered removing the is published filter so this view could be used for draft editing but 
# in that case the user would be able to fetch a post that isn't published - they'd have the response
# even if the page didn't render. A solution for later could be to make a separate view that just checks if an entity is published

    def get(self, filename):
        post = Entity.query.filter(Entity.parent_id.is_(None), Entity.published.is_(True), Entity.artwork_path.is_(filename)).first()
        if not post:
            return make_response({'error': '404 post not found'}, 404)
        return make_response(entity_schema.dump(post), 200)
    
api.add_resource(PostByFilename, '/posts/<path:filename>')

class EditingPost(Resource):

    def get(self, filename):
        post = Entity.query.filter(Entity.parent_id.is_(None), Entity.artwork_path.is_(filename)).first()
        # arg Entity.user_p.username.is_(session.get('username')) doesnt work for accessing nested attributes ig
                                   
        if entity_schema.dump(post)['user_p']['username'] != session.get('username'):
            return make_response({'error': 'Not owner of post'}, 401)
        return make_response(entity_schema.dump(post), 200)
    
api.add_resource(EditingPost, '/drafts/<path:filename>') # might clash when trying to implement comment editing

class ArtworkSchema(ma.Schema): #add validation!

    # file = fields.Raw(required=True)
    file_path = fields.String(required=True)

artwork_schema = ArtworkSchema()

class Artworks(Resource):

    def post(self):
            file_data = request.files['image']
            # filename = secure_filename(file_data.filename)
            filename = secure_filename(uuid4().hex) + '.jpg'
            file_path = os.path.join('./artworks/', filename)

            errors = avatar_schema.validate({'file_path': file_path})
            if errors:
                return make_response({'errors': errors}, 400)
            
            file_data.save(file_path)
            return make_response(artwork_schema.dump({'filename': filename, 'file_path': file_path}), 201)

api.add_resource(Artworks, '/artworks')

class ArtworkByName(Resource):

    def delete(self, filename):
        file_path = f'artworks/{filename}.jpg'
        if not os.path.isfile(file_path):
            return make_response({'error': '404 file not found'}, 404)
        os.remove(file_path)
        response = make_response('', 204)
        response.headers['message'] = '204: No Content'
        return response
    
api.add_resource(ArtworkByName, '/artworks/<path:filename>')
    
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

class Login(Resource):

    def post(self):
        #takes unhashed password
        user = User.query.filter_by(username = request.get_json()['username']).first()
        password = request.get_json()['password']
        if user.authenticate(password):
            session['user_id'] = user.id
            session['username'] = user.username
            return make_response(user_schema.dump(user), 200)
        return make_response({'error': 'Not the password associated with that username'}, 401)

api.add_resource(Login, '/login')

class CheckSession(Resource):

    def get(self):
        user = User.query.filter_by(id=session.get('user_id')).first()
        if user:
            return make_response(user_schema.dump(user), 200)
        return make_response({'message': '401: Not Authorized'}, 401)

api.add_resource(CheckSession, '/check_session')

class Logout(Resource):

    def delete(self): # 204 response can't have body so we are including a header
        session['user_id'] = None
        session['username'] = None
        response = make_response('', 204)
        response.headers['message'] = '204: No Content'
        return response
    
api.add_resource(Logout, '/logout')

# class Posts(Resource):

#     def get(self):
#         posts = Entity.query.filter(Entity.parent_id.is_(None)).all()
#         return make_response(entities_schema.dump(posts), 200)
    
# api.add_resource(Posts, '/posts')

# class PostsByUser:
#     pass

# class Comments(Resource):
#     pass