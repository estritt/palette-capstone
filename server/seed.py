from app import app
from models import db, User, Entity, Like, Follow


if __name__ == '__main__':
    with app.app_context():
        print("Starting seed...")
        print("Deleting data...")
        User.query.delete()
        Entity.query.delete()
        Like.query.delete()
        Follow.query.delete()

        print("Creating users...")
        first_user = User(username='first', password='1234', bio='first bio')
        second_user = User(username='no_bio', password='1234')
        db.session.add_all([first_user, second_user])
        db.session.commit()

        print("Creating posts...")
        first_post = Entity(user_id=first_user.id, published=True, title='test title', artwork_path='test_path', body='Here\'s a tree!')
        db.session.add(first_post)
        db.session.commit()

        print("Creating comments...")
        first_comment = Entity(user_id=second_user.id, published=True, parent_id=first_post.id, body='first!')
        db.session.add(first_comment)
        db.session.commit() # need to commit first so the response has an id to refer to
        response_to_first_comment = Entity(user_id=first_user.id, published=True, parent_id=first_comment.id, body='quality commentary')
        db.session.add(response_to_first_comment)
        db.session.commit()

        print("Liking posts and comments...")
        first_like = Like(user_id=second_user.id, entity_id=first_post.id)
        second_like = Like(user_id=first_user.id, entity_id=first_comment.id)
        third_like = Like(user_id=second_user.id, entity_id=response_to_first_comment.id)
        db.session.add_all([ first_like, second_like, third_like ])
        db.session.commit()

        print("Creating followage...")
        u2_follows_u1 = Follow(following_user_id=second_user.id, followed_user_id=first_user.id)
        db.session.add(u2_follows_u1)
        db.session.commit()

        print("All done!")