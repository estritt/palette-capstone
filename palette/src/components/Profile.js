import { Container, Image, Row, Col, Button, Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import { useAuth } from "./AuthContext";
import ArtThumbnail from "./ArtThumbnail";

function Profile() { // add useAuth to check if it's ur own profile for editing
    
    const params = useParams();
    const parID = params.id;
    const { activeUser } = useAuth();

    const [ profile, setProfile ] = useState(null);
    const [ isOwn, setIsOwn ] = useState(false);
    const [ avatarPath, setAvatarPath ] = useState("");

    useEffect(() => {
        fetch(`/users/${parID}`)
        .then(response => response.json())
        .then(data => {
            setProfile(data)
            if (activeUser) {if (data.url.self == activeUser.url.self) {setIsOwn(true);}}  
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
    }, [params]);

    // useEffect(() => { //avatar_path is the field in user data, AvatarPath is the link for src
    //     fetch(`/avatars/${profile.avatar_filename}`)
    //     .then(response => response.blob())
    //     .then(blob => setAvatarPath(URL.createObjectURL(blob)))
    //     .catch(error => console.log(error));
    // }, [profile]);

    if (!profile) return <div>Oops!</div> // redirect error page
    // console.log(profile)
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
                            <Button size="sm" className=''>Follow</Button>
                        </div>
                        <p className='px-3' /*style={{'font-size':13}}*/>Member since {new Date(profile.created_at).toLocaleDateString()}</p>
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
                        return (
                            <Col className='pb-5' xs={12} sm={6} md={4} lg={3} key={post.url.self}>
                                <ArtThumbnail path={post.artwork_path} title={post.title} />
                            </Col>
                        )
                    }) : <p>{profile.username} hasn't posted yet!</p>
                }
            </Row>
        </Container>
    );

}

export default Profile;