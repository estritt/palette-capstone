from app import app
from models import db, User, Entity, Like, Follow

# this file does not handle image storage yet!
# be careful not to delete the test images

if __name__ == '__main__':
    with app.app_context():
        print("Starting seed...")
        print("Deleting data...")
        User.query.delete()
        Entity.query.delete()
        Like.query.delete()
        Follow.query.delete()

        print("Creating users...")
        first_user = User(username='first', avatar_filename='test.jpg', password='1234', bio='"A fox passing through the wood on business of his own stopped several minutes and sniffed. \'Hobbits!\' he thought. \'Well, what next? I have heard of strange doings in this land, but I have seldom heard of a hobbit sleeping out of doors under a tree. Three of them! There\'s something mighty queer behind this.\' He was quite right, but he never found out any more about it."')
        second_user = User(username='no_bio', password='1234')
        db.session.add_all([first_user, second_user])
        db.session.commit()

        print("Creating posts...")
        # artwork will have to already be in directory
        first_post = Entity(user_id=first_user.id, published=True, title='test title', artwork_path='test.jpg', body='Here\'s a tree!')
        second_post = Entity(user_id=first_user.id, published=True, title='carapaintovaggio', artwork_path='055e0be1545b4b87a1a66711d2a84441.jpg', body='Credit to Double Brother')
        db.session.add_all([ first_post, second_post ])
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