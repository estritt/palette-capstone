from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import validates
from sqlalchemy.ext.hybrid import hybrid_property

from config import db, metadata, bcrypt
[ Column, Integer, String, Text, Boolean, File, TimeStamp, func, ForeignKey, relationship, CheckConstraint ] = [
    db.Column, db.Integer, db.String, db.Text, db.Boolean, db.File, db.TimeStamp, db.func, db.ForeignKey, db.relationship, db.CheckConstraint
]

def string_validate(self, key, value, length):
        if not isinstance(value, str):
            raise TypeError(f'{key.capitalize()} isn\'t a string somehow')
        if value == "":
            raise ValueError(f'{key.capitalize()} can\'t be blank')
        if len(value) > length:
            raise ValueError(f'{key.capitalize()} can be at most {length} characters')
        return value

class User(db.model):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    username = Column(String(30), nullable=False, unique=True) # VARCHAR(30)
    bio = Column(Text)
    created_at = Column(TimeStamp, server_default=db.func.now()) # sqlite specifically stores datetime objects as strings and converts them back

    # following = association_proxy('follows', 'user', creator=lambda user_obj: Follow(followed_user=user_obj))
    # followed_by = association_proxy('follows', 'user', creator=lambda user_obj: Follow(following_user=user_obj))
    following = relationship('Follow', back_populates='following_user')
    followed_by = relationship('Follow', back_populates='followed_user')
    # has_liked = relationship('Like', back_populates='user')
    likes = relationship('Like', back_populates='user')
    has_liked = relationship('Entity', secondary='likes', back_populates='liked_by')

    @validates('username')
    def validate_username(self, key, username):
        return string_validate(self, key, username, 30)
    
    @validates('bio')
    def validate_username(self, key, bio):
        return string_validate(self, key, bio, 3000) # better truncate

class Follow(db.Model):
    __tablename__ = 'follows'

    following_user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    followed_user_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    created_at = Column(TimeStamp, server_default=func.now())
    last_updated = Column(TimeStamp, onupdate=func.now())

    following_user = relationship('User', foreign_keys=['following_user_id'], back_populates='following')
    followed_user = relationship('User', foreign_keys=['followed_user_id'], back_populates='followed_by')

class Entity(db.Model):
    __tablename__ = 'entities'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    parent_id = Column(Integer, ForeignKey('entities.id'))
    published = Column(Boolean, nullable=False) # determines if draft
    artwork = Column(File) # can't be empty if no parent id
    title = Column(Text) # must be empty if has parent id
    body = Column(Text) # can't be empty if has parent id
    created_at = Column(TimeStamp, server_default=func.now())
    last_updated = Column(TimeStamp, onupdate=func.now())

    __table_args__ = (
        CheckConstraint(
            "(parent_id IS NULL AND title IS NULL AND body IS NOT NULL) OR (parent_id IS NOT NULL AND title IS NOT NULL AND artwork IS NOT NULL AND body IS NULL)",
            name="check_post_or_comment"
        ),
    )

    user = relationship('User', back_populates='entities')
    children = relationship("Entity")
    likes = relationship('Like', back_populates='entity')
    liked_by = relationship('User', secondary='likes', back_populates='has_liked')

    @validates('artwork')
    def validate_artwork(self, key, artwork): 
        pass # what kind of nonvalid art might a user submit?
        return artwork
    
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
    created_at = Column(TimeStamp, server_default=func.now())

    user = relationship('User', back_populates='likes')
    entity = relationship('Entity', back_populates='likes')