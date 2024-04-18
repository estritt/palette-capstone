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
        first_user = User(username='first_user', avatar_filename='test.jpg', password='1234', bio='"A fox passing through the wood on business of his own stopped several minutes and sniffed. \'Hobbits!\' he thought. \'Well, what next? I have heard of strange doings in this land, but I have seldom heard of a hobbit sleeping out of doors under a tree. Three of them! There\'s something mighty queer behind this.\' He was quite right, but he never found out any more about it."')
        second_user = User(username='no_bio', password='1234')
        third_user = User(username='demo', avatar_filename='test.jpg', password='1234', bio='I\'m here to test the site!')
        db.session.add_all([first_user, second_user, third_user])
        db.session.commit()

        print("Creating posts...")
        # artwork will have to already be in directory
        first_post = Entity(user_id=first_user.id, published=True, title='happy little trees', artwork_path='3762e3a33218441da2a2eae0732d65e3.jpg', body='Here/s a landscape I made c:')
        second_post = Entity(user_id=first_user.id, published=True, title='mushroom', artwork_path='8fd0223a5acf4feea6a114080dbcf223.jpg', body='no clue what species it is')
        third_post = Entity(user_id=first_user.id, published=True, title='Agape', artwork_path='4d10ee946f014400b5ba784cb723d3c5.jpg', body='this was in my drafts for a long time')
        fourth_post = Entity(user_id=second_user.id, published=True, title='eye practice', artwork_path='47429c152f624859a3cc6d5d00c181bb.jpg', body='part of a larger study')
        fifth_post = Entity(user_id=third_user.id, published=True, title='000', artwork_path='5ebc9f5cc4254c699f3adc1ea7326acd.jpg')
        db.session.add_all([ first_post, second_post, third_post, fourth_post, fifth_post ])
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
        u1_follows_u2 = Follow(following_user_id=first_user.id, followed_user_id=second_user.id)
        u2_follows_u1 = Follow(following_user_id=second_user.id, followed_user_id=first_user.id)
        u3_follows_u1 = Follow(following_user_id=third_user.id, followed_user_id=first_user.id)
        u3_follows_u2 = Follow(following_user_id=third_user.id, followed_user_id=second_user.id)
        db.session.add_all([ u1_follows_u2, u2_follows_u1, u3_follows_u1, u3_follows_u2 ])
        db.session.commit()

        print("All done!")