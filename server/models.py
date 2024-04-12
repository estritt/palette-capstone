from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import validates
from sqlalchemy.ext.hybrid import hybrid_property

#need to add cascade args to relationships so deleting user deletes their content
#although if there's a comment on their comment, that might not work?
#might just need to grey their name

#a lot of relationships should be set to read-only. I don't want to patch a user to have a new liked entity, I want to post a new row to likes

# artwork path should be changed to artwork filename

from config import db, metadata, bcrypt
[ Column, Integer, String, Text, Boolean, TIMESTAMP, func, ForeignKey, relationship, CheckConstraint ] = [
    db.Column, db.Integer, db.String, db.Text, db.Boolean, db.TIMESTAMP, db.func, db.ForeignKey, db.relationship, db.CheckConstraint
]

def string_validate(self, key, value, length):
        if not isinstance(value, str):
            raise TypeError(f'{key.capitalize()} isn\'t a string somehow')
        if value == "":
            raise ValueError(f'{key.capitalize()} can\'t be blank')
        if len(value) > length:
            raise ValueError(f'{key.capitalize()} can be at most {length} characters')
        return value

class Follow(db.Model):
    __tablename__ = 'follows'

    following_user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    followed_user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    following_user = relationship('User', foreign_keys=[following_user_id], back_populates='following')
    followed_user = relationship('User', foreign_keys=[followed_user_id], back_populates='followed_by')

class User(db.Model):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String(30), nullable=False, unique=True) # VARCHAR(30)
    avatar_filename = Column(String)
    _password_hash = Column(String, nullable=False) # need private version as column
    bio = Column(Text)
    created_at = Column(TIMESTAMP, server_default=db.func.now()) # sqlite specifically stores datetime objects as strings and converts them back

    # following = association_proxy('follows', 'user', creator=lambda user_obj: Follow(followed_user=user_obj))
    # followed_by = association_proxy('follows', 'user', creator=lambda user_obj: Follow(following_user=user_obj))
    following = relationship('Follow', foreign_keys=[Follow.following_user_id], back_populates='following_user')
    followed_by = relationship('Follow', foreign_keys=[Follow.followed_user_id],back_populates='followed_user')
    likes = relationship('Like', back_populates='user', viewonly=True)
    has_liked = relationship('Entity', secondary='likes', back_populates='liked_by', viewonly=True)
    # entities = relationship('Entity', back_populates='user')
    posts = relationship('Entity', primaryjoin="and_(User.id == Entity.user_id, Entity.parent_id.is_(None))", back_populates='user_p', viewonly=True)
    comments = relationship('Entity', primaryjoin="and_(User.id == Entity.user_id, Entity.parent_id.is_not(None))", back_populates='user_c', viewonly=True)

    def __init__(self, username, password, avatar_filename=None, bio=None):
        # an init method ensures password hashing is carried out
        self.username = username
        self.password_hash = password
        self.avatar_filename = avatar_filename
        self.bio = bio

    @hybrid_property
    def password_hash(self):
        return self._password_hash
    
    @password_hash.setter
    def password_hash(self, password):
        password_hash = bcrypt.generate_password_hash(password.encode('utf-8'))
        self._password_hash = password_hash.decode('utf-8')

    def authenticate(self, password):
        return bcrypt.check_password_hash(self.password_hash, password.encode('utf-8'))

    @validates('username')
    def validate_username(self, key, username):
        return string_validate(self, key, username, 30)
    
    @validates('bio')
    def validate_username(self, key, bio):
        if bio is None:
            return None
        return string_validate(self, key, bio, 3000) # better truncate
    

class Entity(db.Model): 
    # this will store both new thread posts and comments
    # for a more complex application, they should maybe be separated
    # apparently the Reddit database only has two tables though! Data and Things
    __tablename__ = 'entities'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    parent_id = Column(Integer, ForeignKey('entities.id'))
    published = Column(Boolean, nullable=False) # determines if draft
    artwork_path = Column(String) # can't be empty if no parent id
    title = Column(Text) # must be empty if has parent id
    body = Column(Text) # can't be empty if has parent id
    created_at = Column(TIMESTAMP, server_default=func.now())
    last_updated = Column(TIMESTAMP, onupdate=func.now())

    __table_args__ = (
        CheckConstraint(
            "(parent_id IS NULL AND title IS NOT NULL AND artwork_path IS NOT NULL) OR (parent_id IS NOT NULL AND title IS NULL AND body IS NOT NULL)",
            name="check_post_or_comment"
        ),
    )

    # user = relationship('User', back_populates='entities')
    user_p = relationship('User', back_populates='posts', primaryjoin="and_(User.id == Entity.user_id, Entity.parent_id.is_(None))", viewonly=True)
    user_c = relationship('User', back_populates='comments', primaryjoin="and_(User.id == Entity.user_id, Entity.parent_id.isnot(None))", viewonly=True)
    children = relationship("Entity")
    likes = relationship('Like', back_populates='entity', viewonly=True)
    liked_by = relationship('User', secondary='likes', back_populates='has_liked', viewonly=True)

    @validates('artwork_path')
    def validate_artwork(self, key, artwork_path): 
        pass # what kind of nonvalid art might a user submit?
        return artwork_path
    
    @validates('title')
    def validate_title(self, key, title):
        return string_validate(self, key, title, 200)
    
    @validates('body')
    def validate_body(self, key, body):
        return string_validate(self, key, body, 3000)

class Like(db.Model):
    __tablename__ = 'likes'

    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    entity_id = Column(Integer, ForeignKey('entities.id'), primary_key=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # these for views, not manipulating the database
    user = relationship('User', back_populates='likes', viewonly=True) 
    entity = relationship('Entity', back_populates='likes', viewonly=True)