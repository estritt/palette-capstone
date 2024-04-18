import { Container, Image, Row, Col, Button, Form } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useForm, Controller } from 'react-hook-form';

import { useAuth } from "./AuthContext";
import ArtThumbnail from "./ArtThumbnail";

function Profile() { // add useAuth to check if it's ur own profile for editing
    
    const params = useParams();
    const parID = params.id;
    const { activeUser, changeName } = useAuth();

    const [ profile, setProfile ] = useState(null);
    const [ isOwn, setIsOwn ] = useState(false);
    const [ isEditing, setIsEditing ] = useState(false);
    const [ avatarPath, setAvatarPath ] = useState("");
    const [ follows, setFollows ] = useState(false);

    const {setError, handleSubmit, control, reset, formState: {errors}, getValues                      
    } = useForm();

    useEffect(() => {
        fetch(`/users/${parID}`)
        .then(response => response.json())
        .then(data => {
            if (activeUser) {
                if (data.url.self == activeUser.url.self) {
                    setIsOwn(true);
                } else if (activeUser.following.some(e => e.followed_user.username == data.username)) {
                    setFollows(true); 
                }
                
            }  
            setProfile(data)
            if (data.avatar_filename) {
                fetch(`/images/avatars/${data.avatar_filename}`)
                .then(response => response.blob())
                .then(blob => setAvatarPath(URL.createObjectURL(blob)))
                .catch(error => console.log(error));
            } else {
                setAvatarPath('/default_pfp.png');
            }
        })
        .catch(error => console.log(error));
    }, [activeUser]); // the dependecy is needed for setIsOwn but it unfortunately triggers another fetch

    // useEffect(() => { //avatar_path is the field in user data, AvatarPath is the link for src
    //     fetch(`/avatars/${profile.avatar_filename}`)
    //     .then(response => response.blob())
    //     .then(blob => setAvatarPath(URL.createObjectURL(blob)))
    //     .catch(error => console.log(error));
    // }, [profile]);

    const saveChanges = async (data) => { //will need to add stuff for updating avatar

        // for some reason, i am getting cyclic error from json stringify even though
        // it is returning the correct result. i use stringify on hook-form data
        // in the login page without having this issue. the try loop prevents
        // eslint from closing the page while still sending the right request

        Array.from(Object.entries(data)).forEach(([key, value]) => {
            if (!value) {delete data[key]} //remove empty inputs
        })
        try {
        fetch(`/users/${activeUser.url.self.split('=')[1]}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(updatedUser => {
            changeName(updatedUser.username);
            setProfile(updatedUser);
            setIsEditing(!isEditing);
        });} catch {return}
    }

    function handleFollow() { // this and unfollow give 500 errors but the db is still updated correctly
        fetch('/follows', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                followed_user_id: profile.url.self.split('=')[1],
                following_user_id: activeUser.url.self.split('=')[1]
            })
        })
        .then(() => setFollows(true))
    }

    function handleUnfollow() {
        fetch(`/follows/${activeUser.url.self.split('=')[1]}/${profile.url.self.split('=')[1]}`, {
            method: 'DELETE',
        })
        .then(() => setFollows(false))
    }

    if (!profile) return <div>Oops!</div> // redirect error page

    if (isEditing) {return (
        <Container fluid className='p-6'>
            <div style={{'backgroundColor': 'var(--background)'}} className='border border-3 border-secondary square rounded-2 p-5 mb-5'>
            
            <Form onSubmit={handleSubmit(saveChanges)} className='ms-0'>
                {/* would make more sense to have info and avatar be separate cols */}
                <Col xs={8} className='d-flex p-1'>
                    <Image
                        src = {avatarPath}
                        height='100rem' //should just use fluid later
                    />
                    <div>
                        <div className='d-flex justify-contents-left align-items-center'>
                            <Form.Group controlId='username' className='px-3 pt-3'>
                                <Form.Label>Username</Form.Label>
                                <Controller
                                    as={<Form.Control type="username" />}
                                    control={control}
                                    name='username'
                                    render={({field: { onChange, onBlur, value, ref }}) => (
                                        <Form.Control 
                                            onChange={onChange} 
                                            value={value} 
                                            ref={ref} 
                                            defaultValue={profile.username}
                                        />
                                    )}
                                />
                            {errors.username && <Form.Text>Username is required</Form.Text>}
                            </Form.Group>
                            <Button type='submit' onClick={saveChanges} size="sm" className=''>save changes</Button>
                            <div className='p-2'><Button  onClick={() => {reset(); setIsEditing(!isEditing)}} size="sm" className=''>discard changes</Button></div>
                        </div>
                    </div>
                </Col>
            
            <Row>
                <Form.Group controlId='bio' className='pt-3'> 
                {/* would be useful to keep users from typing over the character limit */}
                    <Form.Label>Bio</Form.Label>
                    <Controller
                        as={<Form.Control type="bio" />}
                        control={control}
                        name='bio'
                        render={({field: { onChange, onBlur, value, ref }}) => (
                            <Form.Control 
                                as='textarea'
                                style={{ height: '200px', 'resize': 'none' }}
                                onChange={onChange} 
                                value={value} 
                                ref={ref} 
                                defaultValue={profile.bio}
                            />
                        )}
                    />
                    {errors.username && <Form.Text>Username is required</Form.Text>}
                </Form.Group>
            </Row>
            </Form>
            </div>
        </Container>
    )}

    return (
        <Container fluid className='p-6'>
            {/* might make more sense to have two containers instead of a div with row children */}
            <div style={{'backgroundColor': 'var(--background)'}} className='border border-3 border-secondary square rounded-2 p-5 mb-5'>
            <Row >
                {/* would make more sense to have info and avatar be separate cols */}
                <Col xs={6} className='d-flex p-1'>
                    <Image
                        src = {avatarPath}
                        height='100rem'
                    />
                    <div>
                        <div className='d-flex justify-contents-left align-items-center'>
                            <p className='px-3 pt-3'>{profile.username}</p>
                            {isOwn ? 
                                <Button onClick={() => setIsEditing(!isEditing)} size="sm" className=''>Edit Profile</Button>
                            : 
                                follows ? 
                                    <Button onClick={handleUnfollow} size="sm">unfollow</Button> 
                                :
                                    <Button onClick={handleFollow} size="sm">follow</Button> 
                            }
                        </div>
                        <p className='px-3'>Member since {new Date(profile.created_at).toLocaleDateString()}</p>
                    </div>
                </Col>
            </Row>
            <Row>
                <p className='pt-3'>{profile.bio}</p>
            </Row>
            </div>
            
            <Row className='align-items-center border border-3 border-secondary square rounded-2 p-5 pb-0 mb-0' style={{'backgroundColor': 'var(--background)'}}>
                {profile.posts ? 
                    profile.posts.map(post => {
                        if (post.published) {
                            return (
                                <Col className='d-flex justify-content-center align-items-center pb-5' xs={12} sm={6} md={4} lg={3} key={post.url.self}>
                                    <ArtThumbnail path={post.artwork_path} title={post.title} />
                                </Col>
                            )
                        }
                    }) : <p>{profile.username} hasn't posted yet!</p> //not set up properly - never shows
                }
            </Row>
        </Container>
    );

}

export default Profile;